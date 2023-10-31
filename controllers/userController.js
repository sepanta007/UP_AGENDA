const { body, validationResult } = require("express-validator");
const bcrypt = require('bcrypt');
const moment = require("moment");
const { Op } = require('sequelize');
const salt = bcrypt.genSaltSync(15);
const { User, Freetime } = require("../models");
let error = [];
catchErrors = (validationError)=>{
    let error = [];
    if(!validationError.isEmpty()){
        error = validationError.array()[0].msg;
    }
    return error;
}
exports.inscription = [
    body("register_first_name").trim().isLength({ min:1}).withMessage("Veuillez remplir le champ Nom.")
    .escape(),
    body("register_last_name").trim().isLength({min:1}).withMessage("Veuillez remplir le champ Prénom.")
    .escape(),
    body("user_name").trim().isLength({min:1}).withMessage("Veuillez remplir le champ Nom d'utilisateur.")
    .escape(),
    body("date_birth").trim().escape().custom((value, { req }) => {
        let today = new Date();
        let dateValue = new Date(value);
        let errDateBirth = (today.getFullYear()<=dateValue.getFullYear() || (today.getFullYear()<=dateValue.getFullYear() && today.getMonth() <= dateValue.getMonth()) || (today.getFullYear()<=dateValue.getFullYear() && today.getMonth() <= dateValue.getMonth() && today.getDate()<=dateValue.getDate()));
        let errAge = ((today.getFullYear() - dateValue.getFullYear()) < 10);
        if (errDateBirth) {
          throw new Error("Votre date de naissance doit être inférieure à la date d'aujourd'hui.");
        }
        else if(errAge){
            throw new Error("Vous devez avoir plus de 10 ans pour accéder à notre site web.");
        }
        return true;
      }),
    body("email_register").trim().isLength({ min: 1 }).withMessage("Veuillez remplir le champ Adresse mail.")
    .isEmail().withMessage("Veuillez saisir une adresse email valide.").escape(),
    body("password_register").trim().isLength({min:8}).withMessage("Votre mot de passe est trop court (< 8 caractères).").escape(),
    body("password_confirmation").trim().escape().custom((value, { req }) => {
      if (value !== req.body.password_register) {
        throw new Error('Le mot de passe et sa confirmation ne coïncident pas.');
      }
      return true;
    }),
    async (req, res, next) => {
    const errors = catchErrors(validationResult(req));
    if (errors.length > 0) {
        req.flash.error = errors;
        res.redirect("/inscription");  
    } 
    else {
        const existingUserEmail = await User.findOne({
            where: {
                email: req.body.email_register
            }
        });
        const existingUserUserName = await User.findOne({
            where: {
                user_name: req.body.user_name
            }
        });
        if (existingUserEmail || existingUserUserName) {
            if (existingUserEmail) {
                req.flash.error = 'Compte déjà existant. Veuillez vous connecter.';
            }
            if (existingUserUserName) {
                req.flash.error = "Nom d'utilisateur déjà existant."
            }
            res.redirect('/inscription');
        } else {
            const default_date = new Date('0001-01-01');
            const newUser = await User.create({
                email : req.body.email_register,
                password : bcrypt.hashSync(req.body.password_register, salt),
                user_name : req.body.user_name,
                first_name : req.body.register_first_name,
                last_name : req.body.register_last_name,
                date_birth : (req.body.date_birth)? req.body.date_birth : default_date,
            })
            req.flash.success = "Utilisateur enregistré."
            res.redirect("/connexion");
        }
    }
  }
]
exports.login = [
    body("email_connexion").trim().isLength({ min: 1 }).withMessage("Veuillez remplir tous les champs.")
    .isEmail().withMessage("Veuillez saisir une adresse mail valide.").escape(),
    body("mPasse").trim().isLength({min:1}).withMessage("Veuillez remplir tous les champs.").escape(),
    async (req, res, next) => {
        const errors = catchErrors(validationResult(req));
        if (errors.length > 0) {
            req.flash.error = errors;
            res.redirect("/connexion");  
        } 
        else{
            const user = await User.findOne({
                where: {
                    email: req.body.email_connexion,
                }
            })
            if (!user) {
                req.flash.error = 'Aucun compte trouvé.';
                res.redirect('/connexion');
            } else {
                if (bcrypt.compareSync(req.body.mPasse, user.password)) {
                    req.session.user = user.email;
                    req.session.userName = user.user_name;
                    req.session.userId = user.id;
                    res.redirect('/');
                } else {
                    req.flash.error = 'Mot de passe invalide.';
                    res.redirect('/connexion');
                }
            }
        }
    }
]
exports.logout = (req, res) => {
    delete req.session.userName;
    delete req.session.user;
    delete req.session.userId;
    res.redirect("/welcome");
}
exports.loadUser = async (req, res) => {
    if (req.session.userId) {
        const user = await User.findOne({
            where: {id: req.session.userId}
        });
        const tmp = user.dataValues;
        tmp.date_birth_parse = moment.tz(user.date_birth,'Europe/Paris').format("YYYY-MM-DD");
        res.send(tmp);
    } else {
        res.redirect('/');
    }
}
exports.searchUsers = async (req, res) => {
    if(req.body.user_name){
        const users = await User.findAll({
            where: {
                user_name: {
                    [Op.not]:req.session.userName,
                    [Op.iLike]:`%${req.body.user_name}%` 
                }
            },
            raw: true,
        });
        res.send(users)
    }
    if (req.body.selected_user) {
        const freeTimes = await Freetime.findAll({
            include: [
                {
                    model: User,
                    as: 'user',
                }
            ],
            where:{
                '$user.user_name' : req.body.selected_user
            },
            raw : true,
        });
        res.send(freeTimes);
    }
}
exports.deleteUser = async (req, res) => {
    const id = req.session.userId;
    const user = await User.findOne({
        where: {
            id,
        }
    });
    if (!user) {
        req.flash.error = 'Utilisateur non trouvé !';
        res.redirect('/');
    } else {
        await User.destroy({
            where: {id}
        });
        req.flash.success = `Utilisateur ${user.name} supprimé !`;
        res.redirect('/');
    }
}
exports.updateUser = [
    body("nom").trim().isLength({ min:1}).withMessage("Veuillez remplir le champ Nom.")
    .escape(),
    body("prenom").trim().isLength({min:1}).withMessage("Veuillez remplir le champ Prénom.")
    .escape(),
    body("email").trim().isLength({min:1}).withMessage("Veuillez remplir le champ Nom d'utilisateur.")
    .escape(),
    body("date_naissance").trim().escape().custom((value, { req }) => {
        let today = new Date();
        let dateValue = new Date(value);
        let errDateBirth = (today.getFullYear()<=dateValue.getFullYear() || (today.getFullYear()<=dateValue.getFullYear() && today.getMonth() <= dateValue.getMonth()) || (today.getFullYear()<=dateValue.getFullYear() && today.getMonth() <= dateValue.getMonth() && today.getDate()<=dateValue.getDate()));
        let errAge = ((today.getFullYear() - dateValue.getFullYear()) < 10);
        if (errDateBirth) {
          throw new Error("Votre date de naissance doit être inférieure à la date d'aujourd'hui.");
        }
        else if(errAge){
            throw new Error("Vous devez avoir plus de 10 ans pour accéder à notre site web.");
        }
        return true;
      }),
    body("email").trim().isLength({ min: 1 }).withMessage("Veuillez remplir le champ adresse mail.")
    .isEmail().withMessage("Veuillez saisir une adresse mail valide.").escape(),
    body("mPasseConfirmation").trim().escape().custom((value, { req }) => {
      if (value !== req.body.mPasse) {
        throw new Error('Le mot de passe et sa confirmation ne coïncident pas.');
      }
      return true;
    }),
    async (req, res, next) => {
        const errors = catchErrors(validationResult(req));
        const { nom, prenom, date_naissance, email, identifiant, mPasse, mPasseConfirmation} = req.body;
        if (errors.length > 0) {
            req.flash.error = errors;
            res.redirect("/settings/personal");  
        } else {
            if (mPasse !== '' && mPasseConfirmation !== '') {
                if (mPasse.length < 8) {
                    throw new Error('Votre mot de passe est trop court.');
                }
                const userUpdate = await User.update({
                    password: bcrypt.hashSync(mPasse, salt),
                    email: email,
                    first_name: prenom,
                    last_name: nom,
                    date_birth: date_naissance,
                    user_name: identifiant
                }, { where: {id: req.session.userId}})
            } else {
                const userUpdate = await User.update({
                    email: email,
                    first_name: prenom,
                    last_name: nom,
                    date_birth: date_naissance,
                    user_name: identifiant
                }, {where: {id: req.session.userId}})
            }
            req.flash.success = 'Votre compte a bien été mis à jour.';
            res.redirect('/settings/personal');
        } 
    }
]
