export type AIVoicePlatform = "whisper" | "polly" | "elevenLabs" | "standard";

export type WhisperVoices = "alloy" | "echo" | "onyx" | "nova" | "shimmer";

export enum WhisperVoicesEnum {
  alloy = "alloy",
  echo = "echo",
  onyx = "onyx",
  nova = "nova",
  shimmer = "shimmer",
}
export type AudioURL = {
    url: string;
   messageID: string;
  }
export type PollyVoices =
  | "Aditi"
  | "Amy"
  | "Adriano"
  | "Astrid"
  | "Andres"
  | "Burcu"
  | "Bianca"
  | "Brian"
  | "Camila"
  | "Carla"
  | "Carmen"
  | "Celine"
  | "Chantal"
  | "Conchita"
  | "Cristiano"
  | "Daniel"
  | "Danielle"
  | "Dora"
  | "Elin"
  | "Emma"
  | "Enrique"
  | "Ewa"
  | "Filiz"
  | "Geraint"
  | "Gabrielle"
  | "Giorgio"
  | "Gregory"
  | "Gwyneth"
  | "Hans"
  | "Hala"
  | "Hannah"
  | "Hiujin"
  | "Ida"
  | "Ines"
  | "Ivy"
  | "Jacek"
  | "Jan"
  | "Joanna"
  | "Joey"
  | "Justin"
  | "Kajal"
  | "Karl"
  | "Kendra"
  | "Kevin"
  | "Kimberly"
  | "Laura"
  | "Lea"
  | "Lisa"
  | "Liv"
  | "Lotte"
  | "Lucia"
  | "Lupe"
  | "Mads"
  | "Maja"
  | "Marlene"
  | "Mathieu"
  | "Matthew"
  | "Maxim"
  | "Mia"
  | "Miguel"
  | "Mizuki"
  | "Naja"
  | "Nicole"
  | "Niamh"
  | "Ola"
  | "Olivia"
  | "Pedro"
  | "Penelope"
  | "Raveena"
  | "Remi"
  | "Ricardo"
  | "Ruben"
  | "Russell"
  | "Ruth"
  | "Salli"
  | "Seoyeon"
  | "Sergio"
  | "Stephen"
  | "Sofie"
  | "Suvi"
  | "Takumi"
  | "Tatyana"
  | "Tomoko"
  | "Vicki"
  | "Vitoria"
  | "Zayd"
  | "Zeina"
  | "Zhiyu";

export enum PollyVoicesEnum {
  Aditi = "Aditi",
  Amy = "Amy",
  Adriano = "Adriano",
  Astrid = "Astrid",
  Andres = "Andres",
  Burcu = "Burcu",
  Bianca = "Bianca",
  Brian = "Brian",
  Camila = "Camila",
  Carla = "Carla",
  Carmen = "Carmen",
  Celine = "Celine",
  Chantal = "Chantal",
  Conchita = "Conchita",
  Cristiano = "Cristiano",
  Daniel = "Daniel",
  Danielle = "Danielle",
  Dora = "Dora",
  Elin = "Elin",
  Emma = "Emma",
  Enrique = "Enrique",
  Ewa = "Ewa",
  Filiz = "Filiz",
  Geraint = "Geraint",
  Gabrielle = "Gabrielle",
  Giorgio = "Giorgio",
  Gregory = "Gregory",
  Gwyneth = "Gwyneth",
  Hans = "Hans",
  Hala = "Hala",
  Hannah = "Hannah",
  Hiujin = "Hiujin",
  Ida = "Ida",
  Ines = "Ines",
  Ivy = "Ivy",
  Jacek = "Jacek",
  Jan = "Jan",
  Joanna = "Joanna",
  Joey = "Joey",
  Justin = "Justin",
  Kajal = "Kajal",
  Karl = "Karl",
  Kendra = "Kendra",
  Kevin = "Kevin",
  Kimberly = "Kimberly",
  Laura = "Laura",
  Lea = "Lea",
  Lisa = "Lisa",
  Liv = "Liv",
  Lotte = "Lotte",
  Lucia = "Lucia",
  Lupe = "Lupe",
  Mads = "Mads",
  Maja = "Maja",
  Marlene = "Marlene",
  Mathieu = "Mathieu",
  Matthew = "Matthew",
  Maxim = "Maxim",
  Mia = "Mia",
  Miguel = "Miguel",
  Mizuki = "Mizuki",
  Naja = "Naja",
  Nicole = "Nicole",
  Niamh = "Niamh",
  Ola = "Ola",
  Olivia = "Olivia",
  Pedro = "Pedro",
  Penelope = "Penelope",
  Raveena = "Raveena",
  Remi = "Remi",
  Ricardo = "Ricardo",
  Ruben = "Ruben",
  Russell = "Russell",
  Ruth = "Ruth",
  Salli = "Salli",
  Seoyeon = "Seoyeon",
  Sergio = "Sergio",
  Stephen = "Stephen",
  Sofie = "Sofie",
  Suvi = "Suvi",
  Takumi = "Takumi",
  Tatyana = "Tatyana",
  Tomoko = "Tomoko",
  Vicki = "Vicki",
  Vitoria = "Vitoria",
  Zayd = "Zayd",
  Zeina = "Zeina",
  Zhiyu = "Zhiyu",
}

export type IndexName = 'avatar-nate-custom' | 'avatar-embeddings-2'
export enum IndexNameEnum {
  'avatar-nate-custom' = 'avatar-nate-custom',
  'avatar-embeddings-2' = 'avatar-embeddings-2'
}