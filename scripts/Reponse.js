<script>
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("userId").style.display = "none";
});

function toggleUserId() {
    var userId = document.getElementById("userId");
    if (userId.style.display === "none") {
        userId.style.display = "inline";
    } else {
        userId.style.display = "none";
    }
}

function openPopup() {
document.getElementById("popup").style.display = "block";
}

function closePopup() {
document.getElementById("popup").style.display = "none";
}

</script>