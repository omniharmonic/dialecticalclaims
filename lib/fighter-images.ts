/**
 * Maps fighter names to their image filenames
 * Images are stored in /public/fighters/
 */

const FIGHTER_IMAGE_MAP: Record<string, string> = {
  // Philosophers & Political Thinkers  
  'Socrates': 'Socrates.png',
  'Plato': 'Plato.png',
  'Aristotle': 'Aristotle.png',
  'René Descartes': 'René Descartes.png',
  'Friedrich Nietzsche': 'Nietzsche.png',
  'Georg Wilhelm Friedrich Hegel': 'Hegel.png',
  'Karl Marx': 'Marx.png',
  'Immanuel Kant': 'Kant.png',
  'Martin Heidegger': 'Heidegger.png',
  'Michel Foucault': 'Foucault.png',
  'Jacques Derrida': 'Derrida.png',
  'Simone de Beauvoir': 'Simone de Beauvoir.png',
  'Albert Camus': 'Camus.png',
  'Thomas Hobbes': 'Thomas Hobbes.png',
  'Jean-Jacques Rousseau': 'Jean-Jacques Rousseau.png',
  'Antonio Gramsci': 'Antonio Gramsci.png',
  'Malcolm X': 'Malcom X.png',
  'Martin Luther King Jr.': 'Martin Luther King Jr.png',
  'Hannah Arendt': 'Hannah Arendt.png',
  'Adam Smith': 'Adam Smith.png',
  'Friedrich Hayek': 'Friedrich Hayek.png',
  'John Maynard Keynes': 'John Maynard Keynes.png',

  // Science & Futurists
  'Charles Darwin': 'Charles Darwin.png',
  'Richard Dawkins': 'Richard Dawkins.png',
  'Nikola Tesla': 'Nikola Tesla.png',
  'Alan Turing': 'Alan Turing.png',
  'Buckminster Fuller': 'Buckminster Fuller.png',
  'Elon Musk': 'Elon Musk.png',
  'Ray Kurzweil': 'Ray Kurzweil.png',
  'Carl Sagan': 'Carl Sagan.png',
  'Richard Feynman': 'Richard Feynman.png',
  'Stephen Hawking': 'Stephen Hawking.png',
  'Neil deGrasse Tyson': 'Neil deGrasse Tyson.png',
  'David Attenborough': 'David Attenborough.png',

  // Literature, Mystics, & Archetypes
  'William Shakespeare': 'William Shakespeare.png',
  'Jorge Luis Borges': 'Jorge Luis Borges.png',
  'Rumi': 'Rumi.png',
  'Lao Tzu': 'Lao Tzu.png',
  'Buddha': 'Buddha.png',
  'Marcus Aurelius': 'Marcus Aurelius.png',
  'Carl Jung': 'Carl Jung.png',
  'Joseph Campbell': 'Joseph Campbell.png',
  'J.R.R. Tolkien': 'JRR Tolkein.png',
  'Ursula K. Le Guin': 'Ursula K Leguin.png',

  // Contemporary Activists & Meme Figures
  'Slavoj Žižek': 'Slavoj Zizek.png',
  'Greta Thunberg': 'Greta Thunberg.png',
  'Donna Haraway': 'Donna Haraway.png',
  'Noam Chomsky': 'Noam Chomsky.png',
  'Alexandria Ocasio-Cortez': 'Alexandria Octasio-Cortez.png',
  'Jordan Peterson': 'Jordan Peterson.png',
  'Bill Nye': 'Bill Nye.png',
  'Judith Butler': 'Judith Butler.png',

  // Religious & Historical Figures
  'Jesus of Nazareth': 'Jesus of Nazareth.png',
  'Benjamin Franklin': 'Benjamin Franklin.png',

  // Environmental & Systems Thinkers
  'Vandana Shiva': 'Vandana Shiva.png',
  'Joanna Macy': 'Joanna Macy.png',

  // Contemporary Philosophy & Consciousness
  'John Vervaeke': 'John Vervaeke.png',
  'Ken Wilber': 'Ken Wilber.png',
  'Hanzi Freinacht': 'Hanzi Freinacht.png',
  'Nora Bateson': 'Nora Bateson.png',

  // Additional Literary & Speculative Voices
  'Octavia Butler': 'Octavia Butler.png',

  // Prison Abolition & Critical Theory
  'Angela Davis': 'Angela Davis.png',

  // Systems Thinking & Leverage Points
  'Donella Meadows': 'Donella Meadows.png',
  'Elinor Ostrom': 'Elinor Ostrom.png',
  'Margaret Wheatley': 'Margaret Wheatley.png',

  // Consciousness Evolution & Integral Ecology
  'Jean Gebser': 'Jean Gebser.png',
  'Adrienne Maree Brown': 'Adrienne Mariee Brown.png',

  // African Cosmology & Decolonial Thought
  'Bayo Akomolafe': 'Bayo Akomolafe.png',

  // Sacred Economics & Gift Culture
  'Charles Eisenstein': 'Charles Eisenstein.png',

  // Mycorrhizal Wisdom & Ecological Storytelling
  'Sophie Strand': 'Sophie Strand.png',

  // Indigenous Science & Plant Wisdom
  'Robin Wall Kimmerer': 'Robin Wall Kimmerer.png',

  // Metacrisis & Civilization Design
  'Daniel Schmachtenberger': 'Daniel Schmachtenberger.png',
}

/**
 * Get the image URL for a fighter
 * Returns the image path or null if no image exists
 */
export function getFighterImageUrl(fighterName: string): string | null {
  const filename = FIGHTER_IMAGE_MAP[fighterName]
  if (!filename) {
    return null
  }
  return `/fighters/${filename}`
}

/**
 * Get all fighter names that have images
 */
export function getFightersWithImages(): string[] {
  return Object.keys(FIGHTER_IMAGE_MAP)
}

