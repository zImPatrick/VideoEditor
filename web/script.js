const { ipcRenderer: ipc } = require('electron');

// cheapQuery
var c$ = q => document.querySelector(q);

var oldValues = [];
var file;

$(document).ready(() => {
    c$("#videoFileInput").addEventListener("change", function() {
        file = this.files[0];
        this.style.display = "none";
    
        c$("#videoElement").src = URL.createObjectURL(this.files[0]);
        c$("#editingPanel").style.display = "block";

        c$("#videoElement").onloadedmetadata = () => {
            var vid = c$("#videoElement");
            c$("#resX").value = vid.videoWidth;
            c$("#resY").value = vid.videoHeight;
            $("#rangeSlider").slider({
                range: true,
                min: 0,
                max: vid.duration,
                values: [0, vid.duration],
                slide: function(event, ui) {
                    if(!oldValues[0]) oldValues[0] = ui.values;

                    if(oldValues[1] != ui.values[1])  vid.currentTime = ui.values[1];
                    if(oldValues[0] != ui.values[0])  vid.currentTime = ui.values[0];

                    c$("#duration1").innerText = ui.values[0];
                    c$("#duration2").innerText = ui.values[1];

                    oldValues = [ui.values[0], ui.values[1]];
                }
            });
            setInterval(() => {
                if(vid.currentTime >= oldValues[1]) vid.pause();
            }, 150)
        }

        
        
    });
    document.forms[0].onsubmit = (e) => {
        e.preventDefault();
        c$("#progressbar").style.width = 0;
        ipc.send("export", {
            path: file.path,
            x: c$("#resX").value,
            y: c$("#resY").value,
            fps: c$("#fps").value,
            startTime: oldValues[0],
            endTime: oldValues[1]
        });
    }
});

ipc.on('exportProgress', (e, percent) => {
    console.log("exportProgress: "+percent)
    c$("#progressbar").style.width = percent +"%";
    c$("#progressbar").innerText = Math.round(percent / 100) * 100+"%";
})
ipc.on('exportDone', (e) => {
    c$("#progressbar").style.width = "100%";
    c$("#progressbar").innerText = "100%";
})