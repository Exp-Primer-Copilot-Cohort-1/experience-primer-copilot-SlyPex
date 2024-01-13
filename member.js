function skillsMember() {
    var member = this;
    var skills = member.skills;
    var skill = skills[Math.floor(Math.random()*skills.length)];
    return skill;
  } 