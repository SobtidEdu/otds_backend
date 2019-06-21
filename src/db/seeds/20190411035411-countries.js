'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.createCollection('countries').then(result => {
    db.insert('countries', [{name_th: 'ประเทศไทย', name_en: 'Thailand', abbr: 'TH'}])
  })
};

exports.down = function(db) {
  return db.dropCollection('countries')
};

exports._meta = {
  "version": 1
};
