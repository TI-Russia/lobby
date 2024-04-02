export function getLobbyText(lobbys, lobby) {
  let text = "";

  lobbys.forEach(function (l, i) {
    if (i > 0) {
      text += ", ";
    }

    text += lobby.find((x) => x.id == l).name;
  });

  return text;
}
