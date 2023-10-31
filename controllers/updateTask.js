const {body, validationResult, sanitizeBody} = require("express-validator");
const moment=require("moment");
const { Task } = require('../models');
catchErrorUpdate = (validationError)=>{
    let error = [];
    if(!validationError.isEmpty()){
        error = validationError.array()[0].msg;
    }
    return error;
}
verifyTask = (req,res)=>{
    let exists = false;
    return exists;
    } 
sendData = async (req,res) => {            
            const taskId = req.params.id;
            const { name, date, start, end, adress, important, description } = req.body;
            Task.findByPk(taskId)
                .then((task) => {
                if (!task) {
                    return res.status(404).send('Tâche non trouvé !');
                }
                task.name = name;
                task.date = date;
                task.start = start;
                task.end = end;
                task.adress = adress;
                task.important = (req.body.important)? true : false;
                task.description = description;
                task.date_end = date_end;
                return task.save();
                })
                .then(() => {
                res.redirect('/evenements');
                })
                .catch((error) => {
                console.error(error);
                res.status(500).send('Une erreur s\'est produite lors de la mise à jour de la tâche.');
                });
}
exports.updateTask = [
    body("name").trim().isLength({min : 1}).withMessage("Veuillez remplir le champ Nom.").escape(),
    body("date").isLength({min:1}).withMessage("Veuillez remplir le champ Date de debut.").isDate().isISO8601().withMessage("La date n'est pas valide.").escape(),
    body("start").isLength({min:1}).withMessage("Veuillez remplir le champ Heure de debut.").escape(),
    body("end").escape(),
    body("description").trim().isLength({max : 1000}).withMessage("Vous avez depasse le nombre de caracteres autorises.")
    .escape(),
    async(req, res) =>{
        const errors = catchErrorUpdate(validationResult(req));
        if(errors.length>0){
            req.flash.error = errors;
            res.redirect(`/modificationTache/${req.params.id}`);
        }else{
            const taskId = req.params.id;
            const { name, date,date_end, start, end, adress, description, important } = req.body;
            Task.update({
                name : name,
                date : date,
                start : start,
                end : end,
                adress : adress,
                important : (important)? true : false,
                description : description,
                date_end : date_end,
            },
            {where : {id : parseInt(req.params.id, 10)}})
            .then((tt) => {
                res.redirect('/evenements');})
            .catch((error) => {
            console.error(error);
            res.status(500).send('Une erreur s\'est produite lors de la mise à jour de la tâche.');});
        }
    }
]
exports.updateTaskPage = async (req,res)=>{
    if(!req.session.userName){
        res.redirect("/welcome");
    }else{
        let error;
        let task = await Task.findOne({
            where :{
                id : parseInt(req.params.id, 10),
            }
        });
        task.dateStart = moment.tz(task.date,'Europe/Paris').format("YYYY-MM-DD");
        task.dateEnd = moment.tz(task.date_end,'Europe/Paris').format("YYYY-MM-DD");
        if(req.flash.error){ 
            error = req.flash.error;
            req.flash.error = undefined;
        }
        res.render("update_task.ejs",{error : error,task:task});
    }
}
