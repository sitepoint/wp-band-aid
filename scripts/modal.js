
function showModal(title, content) {
    var modal;
    modal = $("#bandaid-modal");
    var modalContent = $("#bandaid-modal-content");
    var modalHead = $("#bandaid-modal-head");
    var modalBody = $("#bandaid-modal-body");
    var modalFoot = $("#bandaid-modal-foot");
    var overlay = $("#bandaid-overlay");

    if (!$(modal).length) {
        modal = document.createElement('div');
        modal.id = "bandaid-modal";

        modalContent = document.createElement('div');
        modalContent.id = "bandaid-modal-content";

        modalHead = document.createElement('head');
        modalHead.id = "bandaid-modal-head";

        modalFoot = document.createElement('footer');
        modalFoot.id = "bandaid-modal-foot";
        var closeLink = document.createElement('a');
        closeLink.className = "wp-core-ui button";
        $(closeLink).html("&times; Close");
        $(closeLink).click(hideModal);
        $(modalFoot).append(closeLink);

        modalBody = document.createElement('div');
        modalBody.id = "bandaid-modal-body";

        $(modalContent).append(modalHead);
        $(modalContent).append(modalBody);
        $(modalContent).append(modalFoot);
        $(modal).append(modalContent);

        $("#wpwrap").append(modal);
    }

    if (!$(overlay).length) {
        overlay = document.createElement('div');
        overlay.id = "bandaid-overlay";
        $(overlay).click(hideModal);
        $("#wpwrap").append(overlay);
    }

    $(modalHead).html('<h3>'+ title +'</h3>');
    $(modalBody).html(content);

    $(overlay).show();
    $(modal).show();
}

function hideModal() {
    var modal = $("#bandaid-modal");
    if ($(modal).length) {
        $(modal).hide();
    }
    var overlay = $("#bandaid-overlay");
    if ($(overlay).length) {
        $(overlay).hide();
    }
}