export const ACCURACY_THRESHOLD = 90;
export const ADVANCE_QUIZ_THRESHOLD = 90;
export const QUIZ_TRIGGER_WORDS = 3;
export const STORAGE_KEY = "typing-language-mvp-state-v1";

export const DATA = {
  A1: [
    {
      en: "I would like a coffee without sugar.",
      de: "Ich möchte einen Kaffee ohne Zucker.",
      newWords: [
        { de: "Kaffee", en: "coffee" },
        { de: "ohne", en: "without" },
        { de: "Zucker", en: "sugar" }
      ]
    },
    {
      en: "Where is the train station in this city?",
      de: "Wo ist der Bahnhof in dieser Stadt?",
      newWords: [
        { de: "Bahnhof", en: "train station" },
        { de: "Stadt", en: "city" }
      ]
    },
    {
      en: "I need help with this address.",
      de: "Ich brauche Hilfe mit dieser Adresse.",
      newWords: [
        { de: "brauche", en: "need" },
        { de: "Hilfe", en: "help" },
        { de: "Adresse", en: "address" }
      ]
    }
  ],
  A2: [
    {
      en: "Could we move the meeting to tomorrow morning?",
      de: "Könnten wir das Treffen auf morgen früh verschieben?",
      newWords: [
        { de: "Treffen", en: "meeting" },
        { de: "morgen früh", en: "tomorrow morning" },
        { de: "verschieben", en: "postpone" }
      ]
    },
    {
      en: "I have been learning German for six months.",
      de: "Ich lerne seit sechs Monaten Deutsch.",
      newWords: [
        { de: "seit", en: "for/since" },
        { de: "Monaten", en: "months" }
      ]
    },
    {
      en: "If it rains, we will stay at home and cook.",
      de: "Wenn es regnet, bleiben wir zu Hause und kochen.",
      newWords: [
        { de: "regnet", en: "rains" },
        { de: "bleiben", en: "stay" },
        { de: "zu Hause", en: "at home" }
      ]
    }
  ]
};
