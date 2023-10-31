transformTask = (taskList) => {
  let event = new Array(taskList.length);
  for(let i=0;i<taskList.length;i++){
    event[i] = {
      title : taskList[i].name,
      start : taskList[i].date+"T"+taskList[i].start,
      end : taskList[i].date_end+"T"+taskList[i].end,
    }
  };
  return event;
}
document.addEventListener('DOMContentLoaded',function() {
    var tasks = document.querySelector("body").getAttribute('tasks');
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
      locales : 'fr',
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listYear'
      },
      firstDay :1,
      buttonText: {
        today: 'Aujourd\'hui',
        month:'Mois',
        'week':'Semaine',
        day : 'Jour',
        list: 'Planning',
      },
      navLinks: true,
      selectable: true,
      nowIndicator: true,
      allDayText : '24h',
      themeSystem: 'Litera',
      events : transformTask(JSON.parse(tasks)),
    });
    calendar.render();   
})
