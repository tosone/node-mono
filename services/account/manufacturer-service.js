'use strict';

const AuthService = require('./base/auth-service');
const mongoose = require('mongoose');
const passport = require('passport');

module.exports = class ManufacturerService extends AuthService {

  constructor() {
    super();
    this.name = 'manufacturer';
    this.model = mongoose.model('ManufacturerAccount');
  }

  createTokenExtras(user, done) {
    this.model.findById(user.id).then(function (manufacturerAccount) {
      console.log(manufacturerAccount);
      var manufacturer = manufacturerAccount.manufacturer.toString();
      done(null, { manufacturer });
    }).catch(done);
  }

  getModelDataFromRequest(body) {
    var email = body.email;
    return { email };
  }

  changePwd() {
    let router = require('express').Router();
    router.post('/auth/manufacturer/changeOwnPwd', passport.authenticate('jwt', { session: false }), (req, res) => {
      let id = req.user.sub;
      let oldPassword = req.body.oldPassword;
      let newPassword = req.body.newPassword;

      if (!id || !oldPassword || !newPassword) {
        res.json({ code: 500, msg: 'Can not change password due to wrong args.' });
      } else {
        this.model.findById(id, (err, doc) => {
          if (err) {
            res.json({ code: 500, msg: 'Can not change password due to wrong id.' });
          } else {
            doc.authenticate(oldPassword, (err, admin) => {
              if (err || !admin) {
                res.json({ code: 500, msg: 'Can not change password due to wrong password.' });
              } else {
                admin.setPassword(newPassword, (err, admin) => {
                  if (err) {
                    res.json({ code: 500, msg: 'Can not change password due to password hash with salt error.' });
                  } else {
                    admin.save(err => {
                      if (err) {
                        res.json({ code: 500, msg: 'Can not change password due to mongodb save error.' });
                      } else {
                        res.json({ code: 200 });
                      };
                    });
                  };
                });
              };
            });
          };
        });
      };
    });
    return router;
  }

  resetPwd() {
    let router = require('express').Router();
    router.post("/auth/manufacturer/resetPwd", (req, res) => {
      let email = req.body.email;
      let emailReg = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
      console.log(req.body);
      if (!emailReg.test(email)) {
        res.json({ code: 500, msg: "Not a vaild email." });
      } else {
        this.model.findByUsername(email, (err, doc) => {
          console.log(email);

          if (!(err || doc)) {
            console.log(err);
            res.json({ code: 500, msg: "This email has not been registered yet." })
          } else {
            res.json(doc);
          }
        });
      }
    });
    return router;
  }

  setPwd() {
    let router = require('express').Router();
    router.post("/auth/manufacturer/setPwd", (req, res) => {
      res.json(req.body);
    });
    return router;
  }
}
