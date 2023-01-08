export class GithubUser {
  static search(username) {
    const endpoint = `https://api.github.com/users/${username}`;

    return fetch(endpoint)
      .then((response) => response.json())
      .then(({ login, name, public_repos, followers }) => ({
        login,
        name,
        public_repos,
        followers,
      }));
  }
}

// classe que vai conter a lógica dos dados
// como os dados serão estrurados

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites")) || [];
  }

  save() {
    localStorage.setItem("@github-favorites", JSON.stringify(this.entries));
  }

  async add(username) {
    try {
      const userExists = this.entries.find((entry) => entry.login === username);

      if (userExists) {
        throw new Error("Usuário já cadastrado");
      }

      const user = await GithubUser.search(username);

      if (user.login === undefined) {
        throw new Error("Usuário não encontrado");
      }

      this.entries = [user, ...this.entries];
      this.uptade();
      this.save();
    } catch (err) {
      alert(err.message);
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      (entry) => entry.login !== user.login
    );

    this.entries = filteredEntries;
    this.uptade();
    this.save();
  }
}

// classe que vai criar a visualização e eventos HTML
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);

    this.tbody = this.root.querySelector("table tbody");

    this.uptade();
    this.onadd();
  }

  onadd() {
    const addButton = this.root.querySelector(".search button");

    addButton.onclick = () => {
      const { value } = this.root.querySelector(".search input");

      this.add(value);
    };
  }

  uptade() {
    this.removeAllTr();

    this.entries.forEach((user) => {
      const row = this.createRow();

      row.querySelector(
        ".user img"
      ).src = `https://github.com/${user.login}.png`;

      row.querySelector(".user img").alt = `imagem de ${user.name}`;

      row.querySelector(".user p").textContent = user.name;

      row.querySelector(".user a").href = `https://github.com/${user.login}`;

      row.querySelector(".user span").textContent = user.login;

      row.querySelector(".followers").textContent = user.followers;

      row.querySelector(".remove").onclick = () => {
        const isOk = confirm("Quer mesmo apagar esse usuário?");

        if (isOk) {
          this.delete(user);
        }
      };

      this.tbody.append(row);
    });
  }

  createRow() {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <tr>
      <td class="user">
        <img
          src="https://github.com/maykbrito.png"
          alt="magem de maykbrito"
        />
        <a href="https://github.com/maykbrito">
          <p>Mayk Brito</p>
          <span>maykbrito</span>
        </a>
      </td>
      <td class="respositories">76</td>
      <td class="followers">9589</td>
      <td>
        <button class="remove">&times;</button>
      </td>
    </tr>
  
      `;

    return tr;
  }

  removeAllTr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove();
    });
  }
}
