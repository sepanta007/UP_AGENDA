selectTime = (elem) => {
    const userName = document.querySelector('#chosen_user').getAttribute('user_name');
    const user_name = document.querySelector('#chosen_user').getAttribute('user_id')
    const timeSelected = elem.getAttribute('user_time');
    fetch('/Recherche',{
        method:'POST',
        headers:{
            'Content-type':'application/json'
        },
        body: JSON.stringify({
            userId : userName,
            id : timeSelected,
            userName : user_name
        })
    })
    .then(res => res.json())
    .then(message => {
        if (message) {
            let err = message.messageErr;
            let succ = message.messageSucc;
            if(err){
                document.querySelector(".messages_succ").innerHTML = '';
                document.querySelector(".messages_err").innerHTML = `<div class="alert_error" >${err}</div>`;    
            }
            if(succ){
                document.querySelector(".messages_err").innerHTML = '';
                document.querySelector(".messages_succ").innerHTML = `<div class="alert_success" >${succ}</div>`;
            }
        }
        });
}
selectUser = async (elem)=>{
    const userName = elem.getAttribute('user_name');
    let appointmentArray=`<ul id='chosen_user' class = "select_user" user_name='${userName}' user_id='${elem.getAttribute("user_id")}'>`;
    await fetch('/Recherche',{
        method:'POST',
        headers:{
            'Content-type':'application/json'
        },
        body: JSON.stringify({
            selected_user : userName,
        })
    }).then(res => res.json()).then(appointments =>{
        if(appointments.length > 0){
            appointments.forEach(appointment => {
            let date = new Date(appointment.date);
            appointmentArray +=`<li class="select_time" user_time='${appointment.id}'  onclick='selectTime(this)  '>${appointment.date} ${appointment.date_end} ${appointment.start.substring(0, 5) }-${appointment.end.substring(0, 5)}</li>`});
            appointmentArray +='</ul>'
        }
        else{
            appointmentArray = '<h4>Aucun rendez-vous disponible<h4>';
        }
   })
   document.getElementById('search_result').innerHTML =  appointmentArray;
}
getUser = async (user) =>{
    const inputValue = document.getElementById("user_search").value.trim();
    let userArray = '<ul class="list_result">';
    if(inputValue){
        await fetch('/Recherche',{
            method:'POST',
            headers:{
                'Content-type':'application/json'
            },
            body: JSON.stringify({
                user_name : inputValue,
            })
        }).then(res => res.json()).then(users => {
            if(users.length > 0){
                users.forEach(user => {
                userArray +=`<li user_name='${user.id}' user_id='${user.user_name}' onclick='selectUser(this)' class="list_user">${user.user_name}</li>`});
                userArray +='</ul>'
            }
            else{
                userArray = '<h4>Aucun utilisateur trouvé.<h4>';
            }
        })
    }else{
        userArray = '';
    }
    document.getElementById('search_result').innerHTML = userArray;
}
