// Edit this file to add members. Put photos in /public/team and set `photo` to e.g. "/team/shlok.jpg".
export type Member = { name: string; roll: string; photo?: string };

/** "TODO" and empty strings count as missing. */
export const known = (v?: string) => (v && v.trim() && v.trim().toUpperCase() !== "TODO" ? v.trim() : null);

export const TEAM: Member[] = [
  { name: "Shlok Parikh", roll: "240008027", photo: "/team/shlok.webp" },
  { name: "Nikhil Jakar", roll: "240008020", photo: "/team/nikhil.webp" },
  { name: "Anushka Jain", roll: "240008005", photo: "/team/anushka.webp" },
  { name: "Jayshil Mende", roll: "240008013", photo: "/team/jayshil.webp" },
  { name: "Utkarsh Sharma", roll: "240008033", photo: "/team/utkarsh.webp" },
  { name: "Kodumunja Gnandeep", roll: "230008018" },
];
