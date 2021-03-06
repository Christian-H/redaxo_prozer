<?php

use Sabre\CardDAV\Backend\AbstractBackend;
use Sabre\CardDAV\Plugin;
use Sabre\DAV\Exception\Forbidden;
use Sabre\VObject\Component;
use Sabre\VObject\Parameter;
use Sabre\VObject\Property;
use Sabre\VObject\Reader;

class pz_sabre_carddav_backend extends AbstractBackend
{
    const GROUP = 'my-group';

    private $knownLabels;

    public function __construct()
    {
        $this->knownLabels = array('WORK', 'HOME', 'IPHONE', 'CELL', 'FAX', 'PAGER', 'OTHER', 'MAIN');
    }

    public function getAddressBooksForUser($principalUri)
    {
        if (!pz::getUser()->isAdmin() && !pz::getUser()->hasPerm('carddav')) {
            return array();
        }
        return array(array(
            'id' => 1,
            'uri' => 'prozer_addressbook',
            'principaluri' => $principalUri,
            '{DAV:}displayname' => 'prozer',
            '{' . Plugin::NS_CARDDAV . '}addressbook-description' => '',
            '{http://calendarserver.org/ns/}getctag' => pz::getConfig('addressbook_ctag', 0)
        ));
    }

    public function getCards($addressbookId)
    {
        $addresses = array($this->getGroup());
        foreach (pz_address::getAll() as $address) {
            if ($address->getVar('uri')) {
                $addresses[] = $this->getCardMeta($address);
            }
        }
        return $addresses;
    }

    protected function getCardMeta(pz_address $address)
    {
        $time = strtotime($address->getVar('updated'));
        return array(
            'uri' => $address->getVar('uri'),
            'lastmodified' => $time,
            'etag' => '"' . $time . '"'
        );
    }

    public function getCard($addressBookId, $cardUri)
    {
        if ($cardUri == self::GROUP . '.vcf') {
            return $this->getGroup();
        }

        $address = pz_address::getByUri($cardUri);
        if (!$address) {
            return false;
        }

        return $this->getCardArray($address);
    }

    private function getGroup()
    {
        $card = new Component('vcard');
        $card->version = '3.0';
        $card->prodid = '-//prozer 2.0//';
        $card->__set('X-ADDRESSBOOKSERVER-KIND', 'group');
        $card->n = rex_i18n::msg('mycontacts');
        $card->fn = rex_i18n::msg('mycontacts');
        $card->rev = new Property\DateTime('rev');
        $card->rev->setDateTime(new DateTime(null, new DateTimeZone('UTC')), Property\DateTime::UTC);
        unset($card->rev['value']);
        $card->uid = self::GROUP;
        $sql = rex_sql::factory();
        $sql->setQuery('SELECT uri FROM pz_address WHERE created_user_id = ?', array(pz::getUser()->getId()));
        foreach ($sql as $row) {
            $card->add(new Property('X-ADDRESSBOOKSERVER-MEMBER', 'urn:uuid:' . str_replace('.vcf', '', $sql->getValue('uri'))));
        }
        return array(
            'uri' => self::GROUP . '.vcf',
            'lastmodified' => time(),
            'carddata' => $card->serialize()
        );
    }

    private function getCardArray(pz_address $address)
    {
        $card = new Component('vcard');
        $card->version = '3.0';
        $card->prodid = '-//prozer 2.0//';
        $card->fn = $address->isCompany() ? $address->getCompany() : $address->getFullName();
        $card->n = $address->getName() . ';' . $address->getFirstName() . ';' . $address->getVar('additional_names') . ';' . $address->getVar('prefix') . ';' . $address->getVar('suffix');
        $card->uid = str_replace('.vcf', '', $address->getVar('uri'));
        $card->rev = new Property\DateTime('rev');
        $card->rev->setDateTime(new DateTime($address->getVar('updated')), Property\DateTime::UTC);
        unset($card->rev['value']);
        $this->addToCard($card, 'org', $address->getCompany() . ';' . $address->getVar('department'), ';');
        $this->addToCard($card, 'title', $address->getVar('title'));
        $this->addToCard($card, 'X-ABShowAs', $address->isCompany() ? 'COMPANY' : '');
        $this->addToCard($card, 'note', $address->getNote());
        $this->addToCard($card, 'nickname', $address->getVar('nickname'));
        $this->addToCard($card, 'x-maidenname', $address->getVar('birthname'));
        $this->addToCard($card, 'x-phonetic-last-name', $address->getVar('phonetic_name'));
        $this->addToCard($card, 'x-phonetic-first-name', $address->getVar('phonetic_firstname'));
        if ($birthday = $address->getVar('birthday')) {
            $card->bday = $birthday;
            $card->bday['value'] = 'date';
        }

        $sql = rex_sql::factory();
        $fields = $sql->getArray('SELECT * FROM pz_address_field WHERE address_id = ? ORDER BY type ASC, preferred DESC', array($address->getId()));
        $add = array();
        foreach ($fields as $row) {
            if ($row['type'] = 'IMPP' && in_array($row['value_type'], array('AIM', 'ICQ', 'Jabber', 'MSN', 'Yahoo'))) {
                $newRow = array();
                $newRow['type'] = 'X-' . strtoupper($row['value_type']);
                $newRow['label'] = $row['label'];
                $newRow['preferred'] = $row['preferred'];
                $newRow['value_type'] = '';
                $newRow['value'] = substr($row['value'], strpos($row['value'], ':') + 1);
                $add[] = $newRow;
            }
        }
        $fields = array_merge($fields, $add);
        $i = 1;
        foreach ($fields as $row) {
            $type = $row['type'];
            $property = new Property("item$i.$type", $row['value']);
            $card->add($property);
            switch ($type) {
                case 'ADR': $card->add(new Property("item$i.X-ABADR", $row['value_type'])); break;
                case 'IMPP': $property['x-service-type'] = $row['value_type']; break;
                case 'X-SOCIALPROFILE': $property[] = new Parameter('type', $row['value_type']); break;
                case 'EMAIL': $property[] = new Parameter('type', 'internet'); break;
            }
            foreach (explode(',', $row['label']) as $label) {
                if (in_array($label, $this->knownLabels)) {
                    $property[] = new Parameter('type', $label);
                } elseif ($type != 'X-SOCIALPROFILE' && $label) {
                    $card->add(new Property("item$i.X-ABLabel", $label));
                }
            }
            if ($row['preferred']) {
                $property[] = new Parameter('type', 'pref');
            }
            ++$i;
        }

        if ($photo = $address->getVar('photo')) {
            $card->photo = Reader::read($photo);
        }

        $array = $this->getCardMeta($address);
        $array['carddata'] = str_replace(';BASE64=:', ';BASE64:', $card->serialize());
        return $array;
    }

    private function addToCard($card, $key, $value, $comp = '')
    {
        if ($value != $comp) {
            $card->$key = $value;
        }
    }

    /**
     * Creates a new card
     *
     * @param mixed  $addressBookId
     * @param string $cardUri
     * @param string $cardData
     * @return bool
     */
    public function createCard($addressBookId, $cardUri, $cardData)
    {
        $card = Reader::read($cardData);

        if ($card->__isset('X-ADDRESSBOOKSERVER-KIND') && ((string) $card->__get('X-ADDRESSBOOKSERVER-KIND')) == 'group') {
            self::incrementCtag();
            return false;
        }

        $sql = $this->getSql($card);

        $sql->setValue('uri', $cardUri);
        $sql->setRawValue('created', 'NOW()');
        $sql->setValue('created_user_id', pz::getUser()->getId());
        $sql->insert();

        $address = pz_address::getByUri($cardUri);
        $this->insertFields($card, $address);

        $address->create();

        return true;
    }

    /**
     * Updates a card
     *
     * @param mixed  $addressBookId
     * @param string $cardUri
     * @param string $cardData
     * @return bool
     */
    public function updateCard($addressBookId, $cardUri, $cardData)
    {
        $card = Reader::read($cardData);

        if ($card->__isset('X-ADDRESSBOOKSERVER-KIND') && ((string) $card->__get('X-ADDRESSBOOKSERVER-KIND')) == 'group') {
            self::incrementCtag();
            return false;
        }

        $sql = $this->getSql($card);

        $sql->setWhere(array('uri' => $cardUri));
        $sql->update();

        $address = pz_address::getByUri($cardUri);
        $this->insertFields($card, $address);

        $address->update();

        return true;
    }

    private function getSql($card)
    {
        list($name, $firstname, $additional_names, $prefix, $suffix) = explode(';', $card->n);
        list($company, $department) = array_pad(explode(';', (string) $card->org, 2), 2, '');
        $sql = rex_sql::factory()
            ->setTable('pz_address')
            ->setValue('name', $name)
            ->setValue('firstname', $firstname)
            ->setValue('additional_names', $additional_names)
            ->setValue('prefix', $prefix)
            ->setValue('suffix', $suffix)
            ->setValue('note', (string) $card->note)
            ->setValue('company', $company)
            ->setValue('department', $department)
            ->setValue('is_company', ((string) $card->__get('X-ABShowAs')) == 'COMPANY')
            ->setValue('title', (string) $card->title)
            ->setValue('nickname', (string) $card->nickname)
            ->setValue('phonetic_name', (string) $card->__get('x-phonetic-last-name'))
            ->setValue('phonetic_firstname', (string) $card->__get('x-phonetic-first-name'))
            ->setValue('birthname', (string) $card->__get('x-maidenname'))
            ->setRawValue('updated', 'NOW()')
            ->setValue('updated_user_id', pz::getUser()->getId())
            ->setValue('birthday', '')
            ->setValue('photo', '');
        if (isset($card->bday)) {
            $sql->setValue('birthday', $card->bday);
        }
        if (isset($card->photo)) {
            $sql->setValue('photo', $card->photo->serialize());
        }

        return $sql;
    }

    private function insertFields($card, pz_address $address)
    {
        $addressId = $address->getId();
        $sql = rex_sql::factory();
        $sql->setQuery('DELETE FROM pz_address_field WHERE address_id = ?', array($addressId));

        $count = 0;
        $params = array();
        $fields = array('EMAIL', 'TEL', 'ADR', 'X-SOCIALPROFILE', 'URL', 'IMPP', 'X-ABDATE', 'X-ABRELATEDNAMES');
        $imppFields = array('X-AIM', 'X-ICQ', 'X-JABBER', 'X-MSN', 'X-YAHOO');
        $imppIsset = isset($card->impp);
        foreach ($card->children() as $property) {
            if (!in_array($property->name, $fields) && ($imppIsset || !in_array($property->name, $imppFields))) {
                continue;
            }

            ++$count;
            $type = $property->name;
            $label = array();
            $preferred = 0;
            $value = (string) $property;
            $value_type = '';
            if (isset($property['type'])) {
                foreach ($property['type'] as $typeStr) {
                    foreach (explode(',', $typeStr) as $t) {
                        if (in_array($t, $this->knownLabels)) {
                            $label[] = $t;
                        } elseif (strtolower($t) == 'pref') {
                            $preferred = 1;
                        } elseif (strtolower($t) != 'internet') {
                            $value_type = $t;
                        }
                    }
                }
            }
            if ($property->group && $card->__isset($property->group . '.X-ABLabel')) {
                $label[] = (string) $card->__get($property->group . '.X-ABLabel');
            }
            $label = implode(',', $label);
            switch ($property->name) {
                case 'ADR':
                    $value_type = ((string) $card->__get($property->group . '.X-ABADR')) ?: 'de';
                    break;
                case 'IMPP':
                    $value_type = (string) $property['x-service-type'];
                    break;
                case 'X-AIM':
                    $type = 'IMPP';
                    $value = 'aim:' . $value;
                    $value_type = 'AIM';
                    break;
                case 'X-ICQ':
                    $type = 'IMPP';
                    $value = 'aim:' . $value;
                    $value_type = 'ICQ';
                    break;
                case 'X-JABBER':
                    $type = 'IMPP';
                    $value = 'xmpp:' . $value;
                    $value_type = 'Jabber';
                    break;
                case 'X-MSN':
                    $type = 'IMPP';
                    $value = 'msnim:' . $value;
                    $value_type = 'MSN';
                    break;
                case 'X-YAHOO':
                    $type = 'IMPP';
                    $value = 'ymsgr:' . $value;
                    $value_type = 'Yahoo';
                    break;
            }
            array_push($params, $addressId, $type, $label, $preferred, $value, $value_type);
        }
        if ($count) {
            $values = implode(',', array_pad(array(), $count, '(?, ?, ?, ?, ?, ?)'));
            $sql->setQuery('INSERT INTO pz_address_field (address_id, type, label, preferred, value, value_type) VALUES ' . $values, $params);
        }
    }

    /**
     * Deletes a card
     *
     * @param mixed  $addressBookId
     * @param string $cardUri
     * @return bool
     */
    public function deleteCard($addressBookId, $cardUri)
    {
        $address = pz_address::getByUri($cardUri);
        if ($address) {
            $address->delete();
        }
        return true;
    }

    public static function import($cardData)
    {
        $backend = new self;
        if (preg_match('/^(?:X-AB)?UID:(.*)(?::ABPerson)?\s?$/Umi', $cardData, $matches)) {
            $uri = $matches[1] . '.vcf';
            $sql = rex_sql::factory();
            $sql->setQuery('SELECT id FROM pz_address WHERE uri = ?', array($uri));
            if ($sql->getRows() == 0) {
                $backend->createCard(1, $uri, $cardData);
            } else {
                $backend->updateCard(1, $uri, $cardData);
            }
        } else {
            $sql = rex_sql::factory();
            $sql->setQuery('SELECT UUID() as uid');
            $backend->createCard(1, $sql->getValue('uid') . '.vcf', $cardData);
        }
    }

    public static function export(pz_address $address)
    {
        $backend = new self;
        $arr = $backend->getCardArray($address);
        $card = $arr['carddata'];
        return preg_replace('/^UID:(.*)\s$/im', 'X-ABUID:$1:ABPerson', $card);
    }


    public function updateAddressBook($addressBookId, array $mutations)
    {
        return false;
    }

    public function createAddressBook($principalUri, $url, array $properties)
    {
        throw new Forbidden('Forbidden!');
    }

    public function deleteAddressBook($addressBookId)
    {
        throw new Forbidden('Forbidden!');
    }

    public static function incrementCtag()
    {
        pz::setConfig('addressbook_ctag', pz::getConfig('addressbook_ctag', 0) + 1);
    }
}
