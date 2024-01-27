const bcrypt = require('bcrypt');
const password = process.argv[2];
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err:any, hash:any) {
  console.log(hash);
});