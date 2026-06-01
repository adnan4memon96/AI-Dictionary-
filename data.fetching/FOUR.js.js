
const btn = document.getElementById("btn");
const searchInput = document.getElementById("searchInput");
const resultContainer = document.getElementById("carData");

function renderAlert(message, type = "warning") {
    resultContainer.innerHTML = `<div class="alert alert-${type} text-${type === 'warning' ? 'dark' : 'white'}" role="alert">${message}</div>`;
}

function renderCard(html) {
    resultContainer.innerHTML = html;
}

function formatList(items) {
    return items.map(item => `<span class="badge bg-secondary me-1 mb-1">${item}</span>`).join("");
}

function buildSenseHtml(sense, index) {
    const examples = Array.isArray(sense.examples) ? sense.examples.map(ex => `<div class="text-white">• ${ex}</div>`).join("") : "";
    const tags = Array.isArray(sense.tags) && sense.tags.length ? `<div class="mt-2">${formatList(sense.tags)}</div>` : "";
    const synonyms = Array.isArray(sense.synonyms) && sense.synonyms.length ? `<div class="mt-2"><strong>Synonyms:</strong> ${sense.synonyms.join(", ")}</div>` : "";
    const antonyms = Array.isArray(sense.antonyms) && sense.antonyms.length ? `<div class="mt-2"><strong>Antonyms:</strong> ${sense.antonyms.join(", ")}</div>` : "";

    return `
        <div class="mb-3 text-start border-bottom border-secondary pb-3">
            <h6 class="text-info">Sense ${index + 1}</h6>
            <p class="mb-1">${sense.definition || "No definition available."}</p>
            ${examples}
            ${tags}
            ${synonyms}
            ${antonyms}
        </div>
    `;
}

function buildEntryHtml(entry, index) {
    const partOfSpeech = entry.partOfSpeech ? `<h5 class="text-warning">${entry.partOfSpeech}</h5>` : "";
    const pronunciations = Array.isArray(entry.pronunciations) && entry.pronunciations.length
        ? `<div class="mb-2"><strong>Pronunciation:</strong> ${entry.pronunciations.map(p => p.text || "").filter(Boolean).join(", ")}</div>`
        : "";
    const forms = Array.isArray(entry.forms) && entry.forms.length
        ? `<div class="mb-2"><strong>Forms:</strong> ${entry.forms.map(f => f.word).join(", ")}</div>`
        : "";
    const senses = Array.isArray(entry.senses) && entry.senses.length
        ? entry.senses.map(buildSenseHtml).join("")
        : `<p class="text-white">No senses available for this entry.</p>`;

    return `
        <div class="mb-4 text-start">
            ${partOfSpeech}
            ${pronunciations}
            ${forms}
            ${senses}
        </div>
    `;
}

function renderDefinition(data, searchedWord) {
    const displayWord = data.word || searchedWord;
    const language = data.entries && data.entries[0] && data.entries[0].language ? data.entries[0].language.name : "English";
    const entriesHtml = Array.isArray(data.entries) && data.entries.length
        ? data.entries.map(buildEntryHtml).join("")
        : `<p class="text-white">No entries found for this word.</p>`;

    const cardHtml = `
        <div class="card text-white bg-dark mx-auto mt-2" style="max-width: 42rem;">
            <div class="card-body text-center">
                <h2 class="card-title text-primary fs-1 fw-bold mb-2">${displayWord}</h2>
                <p class="text-secondary mb-3">Language: ${language}</p>
                ${entriesHtml}
            </div>
        </div>
    `;

    renderCard(cardHtml);
}

function fetchWord(word) {
    renderAlert("Loading...", "info");

    fetch(`https://freedictionaryapi.com/api/v1/entries/en/${encodeURIComponent(word)}`)
        .then((res) => {
            if (!res.ok) {
                throw new Error("Word not found. Try another word.");
            }
            return res.json();
        })
        .then((data) => {
            console.log(data);
            if (!data || typeof data !== "object") {
                throw new Error("No definition found.");
            }
            renderDefinition(data, word);
        })
        .catch((err) => {
            console.error(err);
            renderAlert(err.message || "Unable to fetch data.", "danger");
        });
}

btn.addEventListener("click", () => {
    const word = searchInput.value.trim();
    if (!word) {
        renderAlert("Please enter a word to search.");
        return;
    }
    fetchWord(word);
});

searchInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        btn.click();
    }
});

