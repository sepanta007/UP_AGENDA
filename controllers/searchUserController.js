const {Freetime, User, Task} = require("../models");
const {Op} = require('sequelize');
const moment = require('moment');
exports.findUser = async (req,res)=>{
    if(req.body.user_name){
        User.findAll({
            where : {
                user_name :{
                    [Op.not]:req.session.userName,
                    [Op.iLike]:`%${req.body.user_name}%`,
                }
            },
            order: [['user_name', 'ASC']],
            raw : true,
        }).then(user =>{
            res.send(user);
        })
    }
    if(req.body.selected_user){
        Freetime.findAll({
            where:{
                idUser: parseInt(req.body.selected_user, 10),
                date : {[Op.gt] : moment.tz('Europe/Paris').format("YYYY-MM-DD")}
            },
            order: [['date', 'ASC'], ['start', 'ASC']],
            raw : true,
        }).then(freeTime=> {
            freeTime.forEach(elem => {
            elem.date = moment.tz(elem.date,'Europe/Paris').format("DD/MM/YYYY");
            elem.date_end = moment.tz(elem.date_end,'Europe/Paris').format("DD/MM/YYYY");
        });
        res.send(freeTime);
    })
    }
}
exports.getFreeTimeId = async (req,res) =>{
    if(req.body.userId && req.body.id){
        var messageErr = "";
        var messageSucc = "";
        var userId = req.body.userId;
        var userName = req.body.userName;
        await Freetime.findOne({
            where :{
                id : parseInt(req.body.id, 10),
            },
            raw : true,
        }).then(async task => {
            await Task.findOne({
                where : {
                    date : task.date,
                    [Op.or] : [
                        {[Op.and]:[{start : {[Op.lte] : req.body.start}},{end : {[Op.gte] : req.body.start}}]},
                        {[Op.and] : [{start : {[Op.lte] : req.body.end}},{end : {[Op.gte] : req.body.end}}]},
                        {[Op.and] : [{start : {[Op.gte] : req.body.start}},{end : {[Op.lte] : req.body.end}}]}
                    ],
                },
                order: [['date', 'ASC'], ['start', 'ASC']],
                raw : true,
            }).then(async (exist) =>{
                if(exist){
                    messageErr = "Vous avez déjà un événement à cette date.";
                }
                else{
                    await Task.create({
                        date : task.date,
                        start : task.start,
                        end : task.end,
                        important : false,
                        name : "Rendez-vous avec "+ req.session.userName,
                        adress : "",
                        idUser : parseInt(userId, 10),
                    })
                    await Task.create({
                        date : task.date,
                        start : task.start,
                        end : task.end,
                        important : false,
                        name : "Rendez-vous avec "+userName,
                        adress : "",
                        idUser : req.session.userId,
                    })
                    Freetime.destroy({where : {id : req.body.id}});
                    messageSucc = "Vous venez de prendre un rendez-vous avec " + userName;
                } 
            })
        });
        res.send({messageErr : messageErr, messageSucc : messageSucc});
    }
}
