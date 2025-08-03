let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
  const userID = localStorage.getItem("UserID");
  const login = document.getElementById("loginContainer");
  const dashboard = document.getElementById("dashboard");

  const lang = localStorage.getItem("Language") || "English";
  Translate(lang);

  if (userID) {
    login.classList.add("d-none");
    dashboard.classList.remove("d-none");
  } else {
    login.classList.remove("d-none");
    dashboard.classList.add("d-none");
  }
});

function Translate(language) {
  const isGerman = language === "German";

  const translations = {
  submit: isGerman ? "Bestätigen" : "Submit",
  matches: isGerman ? "Verlauf" : "Matches over time",
  total: isGerman ? "Antworten insgesamt" : "Total answers",
  correct: isGerman ? "Richtig" : "Correct",
  incorrect: isGerman ? "Falsch" : "Incorrect",
  maxQuestions: isGerman ? "Maximale Fragen" : "Max Questions",
  correctAnswers: isGerman ? "Richtige Antworten" : "Correct Answers",
  completedSets: isGerman ? "Erledigte Sets" : "Completed Sets"
};

  // Dashboard
  document.querySelector("#dashboard .col-md-6 h4").textContent = translations.matches;
  document.querySelectorAll("#dashboard .col-md-6 h4")[1].textContent = translations.total;

  
      DisplayMenu(translations);
}


function CheckForSavedUser() {
  const username = document.getElementById("usernameInput").value.trim();

  fetch("http://51.21.31.63/getUser.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ UserName: username })
  })
    .then(response => response.json())
    .then(data => {
      console.log("Benutzerantwort:", data);

      if (!data || !data.UserID) {
        throw new Error("Ungültige Benutzerantwort erhalten.");
      }

      localStorage.setItem("UserID", data.UserID); 
      localStorage.setItem("UsesMultipleChoice", data.UsesMultipleChoice); 
      localStorage.setItem("AreSoundEffectsOn", data.AreSoundEffectsOn); 
      localStorage.setItem("Language", data.Language); 
      document.getElementById("loginContainer").classList.add("d-none");
      document.getElementById("dashboard").classList.remove("d-none");

    const lang = localStorage.getItem("Language") || "English";
    Translate(lang);

    })
    .catch(error => {
      console.error("Fehler beim Abrufen des Nutzers:", error);
      alert("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
    });
}


function DisplayMenu(translations) {
  const UserID = localStorage.getItem("UserID");
  if (!UserID) return;

  fetch("http://51.21.31.63/getCompletedSets.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ UserID })
  })
    .then(res => res.json())
    .then(data => {
      const lineCtx = document.getElementById("lineChart");

      if (!data.length) {
        document.querySelector(".chart-wrapper").classList.add("d-none");
        document.querySelector(".circle-chart-wrapper").classList.add("d-none");
        return;
      } else {
        document.querySelector(".chart-wrapper").classList.remove("d-none");
        document.querySelector(".circle-chart-wrapper").classList.remove("d-none");
      }


      const grouped = {};
      let totalMax = 0;
      let totalCorrect = 0;

      data.forEach(entry => {
        const date = entry.SetCompleted.split(" ")[0];
        if (!grouped[date]) grouped[date] = { correct: 0, max: 0 };
        grouped[date].correct += parseInt(entry.SetCorrectAnswers);
        grouped[date].max += parseInt(entry.SetMaxQuestions);

        totalCorrect += parseInt(entry.SetCorrectAnswers);
        totalMax += parseInt(entry.SetMaxQuestions);
      });

      const labels = Object.keys(grouped).sort();
      const correctData = labels.map(date => grouped[date].correct);
      const maxData = labels.map(date => grouped[date].max);
      const yMax = Math.max(...maxData) + 1;
      //LINE CHART
      new Chart(lineCtx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: translations.maxQuestions,
              data: maxData,
              borderColor: "rgba(100, 149, 237, 0.6)",
              backgroundColor: "rgba(100, 149, 237, 0.1)",
              tension: 0.4,
              pointRadius: 5,
              fill: false
            },
            {
              label: translations.correctAnswers,
              data: correctData,
              borderColor: "rgba(33, 150, 243, 1)",
              backgroundColor: "rgba(33, 150, 243, 0.2)",
              tension: 0.4,
              pointRadius: 5,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: true } },
          scales: { y: { beginAtZero: true, suggestedMax: yMax } }
        }
      });

      //PIE CHART
        const pieWrapper = document.querySelector(".circle-chart-wrapper");
        const pieCanvas = document.getElementById("pieChart");

        new Chart(pieCanvas, {
          type: 'pie',
          data: {
            labels: [translations.correct, translations.incorrect],
            datasets: [{
              data: [totalCorrect, totalMax - totalCorrect],
              backgroundColor: ["#2196f3", "#e0e0e0"],
              borderColor: "#ffffff",
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: true, position: "right" }
            }
          }
        });
    });


  //SETS
  fetch("http://51.21.31.63/getSets.php")
    .then(res => res.json())
    .then(sets => {
      console.log("Sets:", sets);
      const container = document.getElementById("setsContainer");
      container.innerHTML = "";
      sets.forEach(set => {
        const col = document.createElement("div");
        col.className = "col-6 col-md-4 mb-2";

        col.innerHTML = `
          <button onclick="StartSet(${set.SetID})" class="btn w-100 text-white" 
                  style="background-image: url('${set.SetImage}'); background-size: cover; height: 200px;">
            <div style="background-color: rgba(0,0,0,0.5); padding: 10px;">${set.SetName}</div>
          </button>
        `;

        container.appendChild(col);
      });
    });
}

function StartSet(SetID) {
  fetch("http://51.21.31.63/getSet.php", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ SetID })
  })
    .then(res => res.json())
    .then(data => {
      console.log("Set:", data);
      localStorage.setItem("currentSet", JSON.stringify(data));
      window.location.href = "query.html";
    });
}

 function Logout() {
    localStorage.clear(); 
    location.reload();    
  };
