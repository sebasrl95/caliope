const main = {
    upload: function () {
        var model = "";
        var audio = $('#audioFile').val();

        if (!!$('#iptModel').val()) {
            model = $('#iptModel').val();
        }

        if (!!audio == false) {
            alert('Por favor ingresa Audio');
            return false;
        }

        $('#loading').removeClass("d-none");
        $("#responseCodeContainer").addClass("d-none");
        var form = $('form')[0];
        var formData = new FormData(form);

        $.ajax({
            url: 'upload',
            data: formData,
            type: 'POST',
            contentType: false,
            processData: false,
            success: function (data) {
                console.log(data);
                if (data.working) {
                    window.location.reload();
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert('Error al enviar la solicitud');
                console.error("Status: " + textStatus);
                console.error("Error: " + errorThrown);
            }
        });

        return false;
    }
};