// Edit this file to add members. Put photos in /public/team and set `photo` to e.g. "/team/shlok.jpg".
export type Member = { name: string; roll: string; photo?: string };

/** "TODO" and empty strings count as missing. */
export const known = (v?: string) => (v && v.trim() && v.trim().toUpperCase() !== "TODO" ? v.trim() : null);

export const TEAM: Member[] = [
  { name: "Shlok Parikh", roll: "240008027", photo: "/team/shlok.jpeg" },
  { name: "Nikhil Jakar", roll: "240008020", photo: "/team/nikhil.jpeg" },
  { name: "Anushka Jain", roll: "240008005", photo: "/team/anushka.jpeg" },
  { name: "Jayshil Mende", roll: "240008013", photo: "/team/jayshil.jpeg" },
  { name: "Utkarsh Sharma", roll: "240008033", photo: "/team/utkarsh.jpeg" },
  { name: "Kodumunja Gnandeep", roll: "230008018" },
];
