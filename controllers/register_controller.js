const { body, validationResult } = require("express-validator");
const User = require("../models/User");
let error = [];
exports.register_user = [
    body("nom").trim().isLength({ min:1}).withMessage("Veuillez remplir tous les champs.")
    .isAlpha().withMessage("Votre nom ne doit contenir que des lettres.").escape(),
    body("prenom").trim().isLength({min:1}).withMessage("Veuillez remplir tous les champs.")
    .isAlpha().withMessage("Votre prénom ne doit contenir que des lettres.").escape(),
    body("date_naissance").trim()
    .isDate().isISO8601().withMessage("La date n'est pas valide.").escape(),
    body("email_inscription").trim().isLength({ min: 1 }).withMessage("Veuillez remplir tous les champs.")
    .isEmail().withMessage("Veuillez saisir une adresse email valide.").normalizeEmail().escape(),
    body("mPasse_inscription").trim().isLength({min:8}).withMessage("Votre mot de passe est trop court (< 8 caractéres).").escape(),
    (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        error = errors.array()[0].msg;
        exports.errors = error;
        res.redirect("/register");  
    } 
    else{
      User.findAll({
        attributes : ["email"],
        where : {
          email: req.body.email_inscription,
        }
    }).then(user => {
      if(user == 0){
        User.create({
          email : req.body.email_inscription,
          password : req.body.mPasse_inscription,
          user_name : "cc",
          first_name : req.body.nom,
          last_name : req.body.prenom
        })
      }
        }
    )
    }
  }
]
