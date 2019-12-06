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
                if (data.response) {
                    $("#responseCodeContainer").removeClass("d-none");
                    $("#downloadLink").attr("href", data.response);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert('Error al enviar la solicitud');
                console.error("Status: " + textStatus);
                console.error("Error: " + errorThrown);
            },
            complete: function () {
                $('#loading').addClass("d-none");
            }
        });

        return false;
    }
};