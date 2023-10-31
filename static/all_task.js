const deleteTask = (id) => {
    fetch(`/api/task/delete/${id}`, {
        method: 'GET',
        headers:{
            'Content-type':'application/json'
        },
    }).then(res => {
        location.reload();
    })
}
const updateTask = (id) => {
    fetch(`/modificationTache/${id}`, {
        method: 'GET',
        headers:{
            'Content-type':'application/json'
        },
    
    }).then(res => {
        location.assign(`/modificationTache/${id}`);    
    })
}
