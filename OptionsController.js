const t = {
  English: {
    Optionen: "Options",
    Antworttyp: "Answer type",
    "Multiple Choice": "Multiple Choice",
    Freitextfeld: "Text field",
    Ton: "Sound",
    Soundeffekte: "Sound effects",
    Sprache: "Language",
    Hinweis: "This does not change the language of the questions.",
    Speichern: "Save",
    Gespeichert: "Saved!"
  },
  German: {
    Optionen: "Optionen",
    Antworttyp: "Antworttyp",
    "Multiple Choice": "Multiple Choice",
    Freitextfeld: "Freitextfeld",
    Ton: "Ton",
    Soundeffekte: "Soundeffekte",
    Sprache: "Sprache",
    Hinweis: "Diese Option ändert nicht die Sprache der Fragen.",
    Speichern: "Speichern",
    Gespeichert: "Gespeichert!"
  }
};

const lang = localStorage.getItem("Language") || "German";
const tr = t[lang];

document.getElementById("saveBtn").addEventListener("click", () => {
  const settings = {
    UserID: localStorage.getItem("UserID"),
    UsesMultipleChoice: document.getElementById("multipleChoice").checked,
    AreSoundEffectsOn: document.getElementById("sfxCheck").checked,
    Language: document.getElementById("langEng").checked ? "English" : "German"
  };

  Object.entries(settings).forEach(([k, v]) => {
    if (k !== "UserID") localStorage.setItem(k, v);
  });

  fetch("https://deacrow.com/submitOptions.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings)
  })
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        alert(tr.Gespeichert);
        location.reload();
      } else {
        alert("Fehler: " + res.error);
      }
    })
    .catch(err => {
      console.error(err);
      alert("Fehler beim Speichern.");
    });
});

Translate();
DisplayOptions();

function Translate() {
  document.getElementById("optionsTitle").innerText = tr.Optionen;
  document.getElementById("answerTypeLabel").innerText = tr.Antworttyp;
  document.getElementById("mcLabel").innerText = tr["Multiple Choice"];
  document.getElementById("textLabel").innerText = tr.Freitextfeld;
  document.getElementById("soundLabel").innerText = tr.Ton;
  document.getElementById("sfxLabel").innerText = tr.Soundeffekte;
  document.getElementById("languageLabel").innerText = tr.Sprache;
  document.getElementById("langNote").innerText = tr.Hinweis;
  document.getElementById("saveBtn").innerText = tr.Speichern;
}

function DisplayOptions() {
  document.getElementById("multipleChoice").checked = localStorage.getItem("UsesMultipleChoice") === "true";
  document.getElementById("textInput").checked = localStorage.getItem("UsesMultipleChoice") === "false";
  document.getElementById("sfxCheck").checked = localStorage.getItem("AreSoundEffectsOn") === "true";
  document.getElementById("langEng").checked = lang === "English";
  document.getElementById("langDe").checked = lang === "German";
}