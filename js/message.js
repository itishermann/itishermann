$(document).ready(function () {
    // Get the modal
    var modal = document.getElementById("modal");
    // Get the button that opens the modal
    var btn = document.getElementById("open_modal");
    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];
    // When the user clicks the button, open the modal 
    btn.onclick = function () {
        $('#modal').fadeToggle(300);
        modal.style.display = 'flex';
    }
    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        $('#modal').fadeToggle(300);
    }
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            $('#modal').fadeToggle(300);
        }
    }

    $('#switch-theme').click(function (e) {
        e.preventDefault();
        switchTheme();
    });

    $('#send_message').click(function (e) {
        e.preventDefault();
        send_message();
    })

})

var isDark = true;

function switchTheme() {
    if (isDark === true) {
        document.documentElement.style.setProperty('--bg-color', '#fff');
        document.documentElement.style.setProperty('--text-color', 'rgb(10,10,10)');
        document.documentElement.style.setProperty('--blog-gray-color', 'rgb(80, 80, 80)');
        isDark = false;
    }
    else {
        document.documentElement.style.setProperty('--bg-color', 'rgb(10, 10, 10)');
        document.documentElement.style.setProperty('--text-color', '#fff');
        document.documentElement.style.setProperty('--blog-gray-color', 'rgb(180, 180, 180)');
        isDark = true;

    }
}

function send_message() {
    $('#sending').fadeToggle(300);
    $('#send').fadeToggle(300);
    var name = $('#name').val();
    var mail = $('#email').val();
    var num = $('#phone').val();
    var message = $('#message').val();

    var data = {
        receiver: 'kaohermann@outlook.fr',
        subject: 'Nouveau message depuis votre portfolio',
        body: `num: ${num}, mail: ${mail}, nom: ${nom} ${prenom}, message: ${message}`,
        data: {
            name: name,
            mail: mail,
            num: num,
            body: message
        }
    };
    console.log(data);

    $.ajax({
        url: "https://api.snowtrust.fr:8443/mail",
        type: 'POST',
        headers: data,
        contentType: 'application/json',
        data: JSON.stringify(data.data),
        success: function (data) {
            console.log(data);
            $('#sending').fadeToggle(100);
            $('#alert_fail').fadeOut(100);
            $('#alert_success').fadeIn(100);
        },
        error: function (data) {
            console.log(data);
            $('#sending').fadeToggle(100);
            $('#alert_success').fadeOut(100);
            $('#alert_fail').fadeIn(100);
            $('#alert_fail').effect("shake");
        }
    });
};