function skillsMember() {

    var skills = document.getElementById("skills");
    var skillsMember = document.getElementById("skillsMember");
    var skillsMemberValue = skillsMember.value;

    if (skillsMemberValue == "") {
        skills.style.display = "none";
    } else {
        skills.style.display = "block";
    }
}