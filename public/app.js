const meetingTypes = {
  emprunteur: {
    label: 'Assurance emprunteur', duration: 30,
    description: 'Délégation, déliaison, changement d’assurance ou étude de garanties.',
    questions: [
      ['Projet concerné', ['Résidence principale', 'Investissement locatif', 'Renégociation', 'Délégation', 'Déliaison']],
      ['Montant approximatif du prêt', 'text'],
      ['Banque concernée', 'text'],
      ['Échéance du projet', ['Moins d’un mois', '1 à 3 mois', 'Plus de 3 mois']]
    ]
  },
  rcpro: {
    label: 'RC Professionnelle', duration: 30,
    description: 'Étude ou mise en place d’une assurance professionnelle réglementée.',
    questions: [
      ['Activité exercée', ['Courtier IAS', 'Courtier IOBSP', 'MIA', 'MIOB', 'Agent immobilier', 'Autre activité']],
      ['Chiffre d’affaires annuel estimé', 'text'],
      ['Contrat actuel en cours ?', ['Oui', 'Non', 'Je ne sais pas']],
      ['Besoin principal', ['Souscription', 'Comparaison', 'Attestation', 'Mise en conformité']]
    ]
  },
  sante: {
    label: 'Mutuelle / Prévoyance', duration: 30,
    description: 'Analyse santé, prévoyance, TNS, senior ou contrat collectif.',
    questions: [
      ['Situation', ['Particulier', 'TNS', 'Entreprise', 'Senior']],
      ['Nombre de personnes à couvrir', 'text'],
      ['Besoin principal', ['Santé', 'Prévoyance', 'Les deux']],
      ['Contrat déjà existant ?', ['Oui', 'Non']]
    ]
  },
  credit: {
    label: 'Crédit immobilier', duration: 45,
    description: 'Projet d’achat, financement, regroupement ou analyse de faisabilité.',
    questions: [
      ['Nature du projet', ['Achat résidence principale', 'Investissement locatif', 'Rachat', 'Regroupement']],
      ['Prix ou montant recherché', 'text'],
      ['Apport disponible', 'text'],
      ['Compromis déjà signé ?', ['Oui', 'Non']]
    ]
  },
  formation: {
    label: 'Formation IAS / IOBSP', duration: 30,
    description: 'Information sur les parcours réglementaires, DDA, DCI, MCD ou ORIAS.',
    questions: [
      ['Parcours souhaité', ['IAS niveau 1', 'IAS niveau 2', 'IOBSP niveau 1', 'MCD/DCI', 'Formation annuelle 15h']],
      ['Nombre de participants', 'text'],
      ['Échéance souhaitée', ['Urgent', 'Dans le mois', 'Dans le trimestre']],
      ['Financement', ['Personnel', 'Entreprise', 'AGEFICE/OPCO', 'À définir']]
    ]
  },
  audit: {
    label: 'Audit conformité', duration: 45,
    description: 'Audit ACPR, LCB-FT, RGPD, parcours client, DER, devoir de conseil.',
    questions: [
      ['Statut concerné', ['IAS', 'IOBSP', 'COA', 'MIA', 'MIOB', 'Agent immobilier']],
      ['Nombre de collaborateurs', 'text'],
      ['Contrôle ACPR déjà subi ?', ['Oui', 'Non']],
      ['Sujet prioritaire', ['Audit complet', 'TRACFIN', 'RGPD', 'DDA/DCI', 'ORIAS', 'Réclamations']]
    ]
  },
  orias: {
    label: 'Création / mise à jour ORIAS', duration: 30,
    description: 'Accompagnement immatriculation, pièces, capacité professionnelle, association.',
    questions: [
      ['Statut demandé', ['COA', 'MIA', 'COBSP', 'MIOBSP', 'CIF', 'Autre']],
      ['Entreprise déjà créée ?', ['Oui', 'Non', 'En cours']],
      ['Diplôme ou expérience disponible ?', ['Oui', 'Non', 'À vérifier']],
      ['Assurance RC Pro déjà souscrite ?', ['Oui', 'Non']]
    ]
  },
  autre: {
    label: 'Autre demande', duration: 30,
    description: 'Toute autre demande nécessitant un échange rapide.',
    questions: [
      ['Objet de la demande', 'textarea'],
      ['Degré d’urgence', ['Faible', 'Normal', 'Urgent']]
    ]
  }
};

let selectedKey = null;
let selectedSlotIso = null;
let selectedAnswers = {};

const $ = (id) => document.getElementById(id);

function show(id) { $(id).classList.remove('hidden'); $(id).scrollIntoView({ behavior: 'smooth', block: 'start' }); }

function renderMeetingTypes() {
  const box = $('meetingTypes');
  Object.entries(meetingTypes).forEach(([key, type]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'type-card';
    btn.innerHTML = `<strong>${type.label}</strong><span>${type.description}</span>`;
    btn.onclick = () => selectMeetingType(key, btn);
    box.appendChild(btn);
  });
}

function selectMeetingType(key, btn) {
  selectedKey = key;
  document.querySelectorAll('.type-card').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderQuestions();
  show('step-questions');
}

function renderQuestions() {
  const form = $('questionsForm');
  form.innerHTML = '';
  meetingTypes[selectedKey].questions.forEach(([label, type], index) => {
    const field = document.createElement('label');
    field.textContent = label;
    let input;
    if (Array.isArray(type)) {
      input = document.createElement('select');
      input.innerHTML = '<option value="">Sélectionner</option>' + type.map(v => `<option>${v}</option>`).join('');
    } else if (type === 'textarea') {
      input = document.createElement('textarea');
      input.rows = 3;
    } else {
      input = document.createElement('input');
    }
    input.dataset.label = label;
    input.required = true;
    input.id = `q${index}`;
    field.appendChild(input);
    form.appendChild(field);
  });
}

$('questionsNext').onclick = () => {
  const inputs = [...$('questionsForm').querySelectorAll('input, select, textarea')];
  selectedAnswers = {};
  for (const input of inputs) {
    if (!input.value.trim()) { input.focus(); return; }
    selectedAnswers[input.dataset.label] = input.value.trim();
  }
  show('step-contact');
};

$('loadSlots').onclick = async () => {
  const required = ['name', 'email'];
  for (const id of required) {
    if (!$(id).value.trim()) { $(id).focus(); return; }
  }
  show('step-slots');
  $('status').textContent = 'Chargement des disponibilités...';
  $('slots').innerHTML = '';

  try {
    const duration = meetingTypes[selectedKey].duration;
    const response = await fetch(`/api/availability?duration=${duration}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erreur de chargement');
    if (!data.slots.length) {
      $('status').textContent = 'Aucun créneau disponible sur la période proposée.';
      return;
    }
    $('status').textContent = `${data.slots.length} créneaux disponibles.`;
    data.slots.forEach(slot => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'slot';
      btn.textContent = slot.label;
      btn.onclick = () => book(slot.iso, btn);
      $('slots').appendChild(btn);
    });
  } catch (error) {
    $('status').textContent = error.message;
  }
};

async function book(slotIso, btn) {
  selectedSlotIso = slotIso;
  btn.disabled = true;
  btn.textContent = 'Réservation en cours...';
  const payload = {
    slotIso: selectedSlotIso,
    duration: meetingTypes[selectedKey].duration,
    meetingLabel: meetingTypes[selectedKey].label,
    reason: meetingTypes[selectedKey].label,
    answers: { ...selectedAnswers, Commentaire: $('comment').value.trim() },
    name: $('name').value.trim(),
    email: $('email').value.trim(),
    phone: $('phone').value.trim(),
    company: $('company').value.trim(),
    siren: $('siren').value.trim()
  };

  try {
    const response = await fetch('/api/book', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erreur de réservation');
    show('step-success');
    $('meetLink').innerHTML = data.meet ? `Lien Google Meet généré : <a href="${data.meet}" target="_blank" rel="noopener">ouvrir le lien</a>` : '';
  } catch (error) {
    btn.disabled = false;
    btn.textContent = 'Réessayer ce créneau';
    alert(error.message);
  }
}

renderMeetingTypes();
