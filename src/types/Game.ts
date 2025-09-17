export type Game = {
  id: string;
  date: Date;
  opponent: string;
  isHome: boolean;
  volunteer: { parent: string; children: string } | null;
};
