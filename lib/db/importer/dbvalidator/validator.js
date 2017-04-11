'use strict';

module.exports = {
  validate: (db, schema) => new Promise((resolve, reject) => {
    db.one('SELECT count(*) FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2', ['public', schema.table_name])
      .then(() => {
        db.many('SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2', ['public', schema.table_name])
          .then((columns) => {
            if (columns.length !== schema.columns.length) {
              reject();
            } else {
              let invalid_column = false;
              for (let column_i = 0; column_i < columns.length; column_i++) {
                if (!schema.columns.includes(columns[column_i].column_name)) {
                  invalid_column = true;
                }
              }
              if (invalid_column) {
                reject();
              } else {
                db.many('SELECT indexname FROM pg_indexes WHERE schemaname = $1 AND tablename = $2', ['public', schema.table_name])
                  .then((indexes) => {
                    if (indexes.length !== schema.indexes.length) {
                      reject();
                    } else {
                      let invalid_index = false;
                      for (let index_i = 0; index_i < indexes.length; index_i++) {
                        if (!schema.indexes.includes(indexes[index_i].indexname)) {
                          invalid_index = true;
                        }
                      }
                      if (invalid_index) {
                        reject();
                      } else {
                        resolve();
                      }
                    }
                  })
                  .catch(reject);
              }
            }
          })
          .catch(reject);
      })
      .catch(reject);
  }),
};