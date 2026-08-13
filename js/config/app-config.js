(function () {
  "use strict";

  window.APP_CONFIG = Object.freeze({
    hubId: "unit-14-software-engineering-for-business",
    hubVersion: "0.1.0",
    siteName: "Unit 14 Software Engineering for Business Hub",
    shortName: "Unit 14 Hub",
    qualification: "OCR Level 3 IT",
    unitCode: "H/507/5017",
    unitName: "Software Engineering for Business",
    coreVersion: "0.1.0",
    learnerApiContractVersion: "0.1.0",
    submissionContractVersion: "0.1.0",
    academicYear: "2026/27",
    currentPhase: "Foundation: Week 1 and assignment workspace",
    navigation: Object.freeze([
      { id: "home", label: "Home", path: "" },
      { id: "learning", label: "Weeks", path: "weeks/" },
      { id: "assignments", label: "Assignments", path: "assignments/" },
      { id: "project", label: "Project", path: "project/" },
      { id: "resources", label: "Resources", path: "resources/" },
      { id: "help", label: "Help", path: "help/" },
      { id: "account", label: "Account", path: "account/" }
    ]),
    features: Object.freeze({
      authentication: true,
      onboarding: true,
      progress: true
    }),
    theme: Object.freeze({
      primary: "#1e3a5f",
      accent: "#2a7a62"
    }),
    curriculumPackage: "content/unit-14"
  });
})();
