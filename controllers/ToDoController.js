const { Todo } = require('../models');
const {body,validationResult } = require("express-validator");
exports.addToDo = [
    body("input_toDo").trim(),
    async (req, res) => {
        if(req.body.del){
            await Todo.destroy({where: {id : req.body.id}});
            res.redirect('/todo');
        }
        else{
            if(req.body.input_toDo){
                if(req.body.input_toDo !='' ){
                    await Todo.create({
                        idUser : req.session.userId,
                        description : req.body.input_toDo,
                    })
                }
            }
            else if(req.body.val){
                await Todo.create({
                    idUser : req.session.userId,
                    description : req.body.val,
                })
            }
            else{
                const todoUpdate = await Todo.update(
                    {description : req.body.newVal},
                    {where : { id : req.body.id }},
                )
            }
            res.redirect('/todo');
        }
    }
]
