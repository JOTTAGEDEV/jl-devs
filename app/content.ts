const message = encodeURIComponent(
  "Olá! Conheci a JL DEVS pelo site e gostaria de conversar sobre um projeto.",
);
export const contacts = [
  {
    name: "JG Dev",
    number: "(48) 98805-8940",
    href: `https://wa.me/5548988058940?text=${message}`,
  },
  {
    name: "Linhar Dev",
    number: "(48) 98876-7877",
    href: `https://wa.me/5548988767877?text=${message}`,
  },
];

export const websiteProjects = [
  {
    name: "Pousada do Dado",
    category: "Hospedagem · Ponta do Papagaio",
    description:
      "Acomodações, galeria de fotos e consulta de estadia pelo WhatsApp em um site pensado para quem está planejando a próxima viagem.",
    image: "/images/projects/pousada-do-dado.webp",
    imageAlt: "Página da Pousada do Dado, com fotografia da fachada e opções de reserva.",
    href: "https://pousadadodado.com/",
    action: "Visitar site",
  },
  {
    name: "Residencial Pôr do Sol",
    category: "Hospedagem · Praia da Pinheira",
    description:
      "Uma apresentação acolhedora dos apartamentos, com fotos reais, informações da região e seleção de datas para consultar uma estadia.",
    image: "/images/projects/residencial-por-do-sol.webp",
    imageAlt: "Página do Residencial Pôr do Sol, com fotos dos apartamentos e apresentação da hospedagem.",
    href: "https://pousadapordosol.vercel.app/",
    action: "Visitar site",
  },
  {
    name: "Auto Serta Mecânica",
    category: "Site institucional · Serviços automotivos",
    description:
      "Serviços, estrutura da oficina e contato direto em uma página responsiva que aproxima a Auto Serta de quem precisa cuidar do carro.",
    image: "/images/projects/auto-serta.webp",
    imageAlt: "Página da Auto Serta Mecânica, com identidade preta e amarela e foto da oficina.",
    href: "https://autoserta.lovable.app/",
    action: "Visitar site",
  },
];
