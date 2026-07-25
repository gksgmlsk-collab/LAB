(function () {
  const data = window.labData;
  if (!data) return;

  const byId = (id) => document.getElementById(id);
  const escapeHtml = (value) => String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
  const stageClassMap = {
    "학교 적용": "stage-school",
    "지속 개선": "stage-improve",
    "학교 적용+지속 개선": "stage-active",
    "내부 테스트": "stage-test",
    "내부테스트": "stage-test",
    "데모": "stage-demo",
    "아이디어": "stage-idea",
    "보류": "stage-hold",
  };
  const externalAttrs = 'target="_blank" rel="noopener noreferrer"';
  const formatEmphasis = (value) => escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replaceAll("\n", "<br>");

  const stageBadge = (stage) => (
    `<span class="stage-badge ${stageClassMap[stage] || "stage-idea"}">${escapeHtml(stage)}</span>`
  );
  const stageOrder = {
    "학교 적용+지속 개선": 0,
    "데모": 1,
    "내부테스트": 2,
    "내부 테스트": 2,
    "아이디어": 3,
    "보류": 4,
  };

  function actionMarkup(action, fallbackLabel) {
    const label = action?.label || fallbackLabel;
    if (action?.url) {
      return `<a class="lab-link" href="${escapeHtml(action.url)}" ${externalAttrs}>${escapeHtml(label)} <span aria-hidden="true">→</span></a>`;
    }
    return `<span class="lab-disabled" aria-disabled="true">${escapeHtml(label || "상세 공개 예정")}</span>`;
  }

  function mediaMarkup(project) {
    if (project.hideMedia) return "";
    if (project.image) {
      const imageClassMap = {
        portrait: "is-portrait",
        contain: "is-contain",
      };
      const imageClass = imageClassMap[project.imageDisplay]
        ? ` class="${imageClassMap[project.imageDisplay]}"`
        : "";
      return `<div class="lab-feature-media">
        <img${imageClass} src="${escapeHtml(project.image)}" alt="${escapeHtml(project.name)} 소개 이미지" loading="lazy">
        <strong class="lab-feature-media-title">${escapeHtml(project.name)}</strong>
      </div>`;
    }
    return `<div class="lab-media-placeholder" role="img" aria-label="${escapeHtml(project.name)} 이미지 준비 중">
      <span>${escapeHtml(project.category)}</span>
      <strong>${escapeHtml(project.name)}</strong>
    </div>`;
  }

  function galleryMarkup(project) {
    if (!project.gallery?.length) return "";
    const galleryClassMap = {
      grid: " is-grid",
      rail: " is-rail",
    };
    const galleryClass = galleryClassMap[project.galleryLayout] || "";
    return `
      <div class="lab-gallery${galleryClass}" aria-label="${escapeHtml(project.name)} 화면 갤러리">
        <div class="lab-gallery-head">
          <strong>화면 갤러리</strong>
          <div class="lab-gallery-head-actions">
            <span>${project.gallery.length}장</span>
            ${project.galleryLayout === "rail" ? `
              <button type="button" class="lab-gallery-scroll" data-gallery-scroll="-1" aria-label="이전 사진 보기" title="이전 사진">←</button>
              <button type="button" class="lab-gallery-scroll" data-gallery-scroll="1" aria-label="다음 사진 보기" title="다음 사진">→</button>
            ` : ""}
          </div>
        </div>
        ${project.galleryNote ? `
          <div class="lab-gallery-note">
            <span>${escapeHtml(project.galleryNote.label)}</span>
            <strong>${escapeHtml(project.galleryNote.title)}</strong>
            <p>${escapeHtml(project.galleryNote.body)}</p>
          </div>
        ` : ""}
        <div class="lab-gallery-strip">
          ${project.gallery.map((image, index) => `
            <button
              class="lab-gallery-thumb${image.highlight ? " is-highlight" : ""}"
              type="button"
              data-project-id="${escapeHtml(project.id)}"
              data-gallery-index="${index}"
              aria-label="${escapeHtml(image.caption)} 크게 보기"
            >
              <img src="${escapeHtml(image.src)}" alt="" loading="lazy">
              <span>${escapeHtml(image.caption)}</span>
            </button>
          `).join("")}
        </div>
      </div>
    `;
  }

  byId("lab-intro-label").textContent = data.intro.label;
  byId("lab-intro-content").innerHTML = `
    <h3 class="lab-title">${escapeHtml(data.intro.title)}</h3>
    ${data.intro.body.map((body) => `<p class="lab-lead">${escapeHtml(body)}</p>`).join("")}
    <div class="lab-message-grid">
      ${data.intro.cards.map((card) => `
        <div class="lab-message-card">
          <div class="k">${escapeHtml(card.title)}</div>
          <div class="v">${escapeHtml(card.body)}</div>
        </div>
      `).join("")}
    </div>
  `;

  const projects = data.projects;
  const featuredIds = ["draconis", "seokam-on", "dolflix"];
  byId("lab-feature-list").innerHTML = featuredIds
    .map((id) => projects.find((project) => project.id === id))
    .filter(Boolean)
    .map((project) => `
      <section class="lab-feature-card${project.id === "draconis" ? " is-primary" : ""}${project.hideMedia ? " has-no-media" : ""}" data-project-id="${escapeHtml(project.id)}" aria-label="${escapeHtml(project.name)} 대표 서비스">
        ${mediaMarkup(project)}
        <div class="lab-feature-body">
          <div class="lab-card-head">
            <span class="lab-category">${escapeHtml(project.category)}</span>
            ${stageBadge(project.stage)}
          </div>
          <h3>${formatEmphasis(project.detailTitle)}</h3>
          <p>${formatEmphasis(project.detailBody)}</p>
          ${project.accessNote ? `<div class="lab-access-note">${escapeHtml(project.accessNote)}</div>` : ""}
          <div class="lab-report-point">${escapeHtml(project.reportPoint)}</div>
          ${galleryMarkup(project)}
          <div class="lab-link-row" style="margin-top:12px">
            ${project.actions
              .filter((action) => action.url)
              .map((action) => actionMarkup(action, "서비스 체험"))
              .join("")}
          </div>
        </div>
      </section>
    `).join("");

  byId("lab-services-lead").innerHTML = data.sectionCopy.servicesLead
    .map((body) => `<p class="lab-body">${escapeHtml(body)}</p>`)
    .join("");

  function renderProjects(filter) {
    const filtered = (filter === "전체"
      ? projects
      : projects.filter((project) => project.category === filter))
      .map((project, index) => ({ project, index }))
      .sort((a, b) => (
        (stageOrder[a.project.stage] ?? 99) - (stageOrder[b.project.stage] ?? 99)
        || a.index - b.index
      ))
      .map(({ project }) => project);

    byId("lab-project-grid").innerHTML = filtered.map((project) => `
      <section class="lab-service-card" aria-label="${escapeHtml(project.name)}">
        <div class="lab-card-head">
          <span class="lab-category">${escapeHtml(project.category)}</span>
          ${stageBadge(project.stage)}
        </div>
        <h3>${escapeHtml(project.name)}</h3>
        <p>${formatEmphasis(project.summary)}</p>
        ${project.accessNote ? `<div class="lab-access-note">${escapeHtml(project.accessNote)}</div>` : ""}
        <div class="lab-owner">${escapeHtml(project.ownerLabel || "개발 및 운영")} ${escapeHtml(project.owner)}</div>
        <div class="lab-link-row">
          ${project.url
            ? actionMarkup({
              label: project.category === "홍보·운영" ? "채널 열기" : "서비스 체험",
              url: project.url,
            })
            : actionMarkup({ label: "상세 공개 예정", url: null })}
        </div>
      </section>
    `).join("");
  }

  byId("filter-bar").innerHTML = data.filters
    .map((filter, index) => `
      <button class="filter-btn" type="button" aria-pressed="${index === 0 ? "true" : "false"}" data-filter="${escapeHtml(filter)}">
        ${escapeHtml(filter)}
      </button>
    `).join("");
  byId("filter-bar").addEventListener("click", (event) => {
    const button = event.target.closest(".filter-btn");
    if (!button) return;
    byId("filter-bar").querySelectorAll(".filter-btn")
      .forEach((item) => item.setAttribute("aria-pressed", "false"));
    button.setAttribute("aria-pressed", "true");
    renderProjects(button.dataset.filter);
  });
  renderProjects("전체");

  const galleryProjects = new Map(
    projects
      .filter((project) => project.gallery?.length)
      .map((project) => [project.id, project])
  );
  if (galleryProjects.size) {
    document.body.insertAdjacentHTML("beforeend", `
      <dialog class="lab-gallery-dialog" id="lab-gallery-dialog" aria-labelledby="lab-gallery-dialog-title">
        <div class="lab-gallery-dialog-shell">
          <div class="lab-gallery-dialog-head">
            <div>
              <strong id="lab-gallery-dialog-title"></strong>
              <span id="lab-gallery-dialog-count"></span>
            </div>
            <button type="button" class="lab-gallery-icon" data-gallery-close aria-label="갤러리 닫기" title="닫기">×</button>
          </div>
          <div class="lab-gallery-dialog-stage">
            <button type="button" class="lab-gallery-icon lab-gallery-prev" data-gallery-prev aria-label="이전 이미지" title="이전 이미지">←</button>
            <img id="lab-gallery-dialog-image" src="" alt="">
            <button type="button" class="lab-gallery-icon lab-gallery-next" data-gallery-next aria-label="다음 이미지" title="다음 이미지">→</button>
          </div>
          <div class="lab-gallery-dialog-caption" id="lab-gallery-dialog-caption"></div>
        </div>
      </dialog>
    `);

    const dialog = byId("lab-gallery-dialog");
    const dialogImage = byId("lab-gallery-dialog-image");
    const dialogTitle = byId("lab-gallery-dialog-title");
    const dialogCount = byId("lab-gallery-dialog-count");
    const dialogCaption = byId("lab-gallery-dialog-caption");
    let activeProject = null;
    let activeIndex = 0;

    function updateGallery() {
      const image = activeProject.gallery[activeIndex];
      dialogImage.src = image.src;
      dialogImage.alt = image.alt;
      dialogTitle.textContent = activeProject.name;
      dialogCount.textContent = `${activeIndex + 1} / ${activeProject.gallery.length}`;
      dialogCaption.textContent = image.caption;
    }

    function moveGallery(direction) {
      activeIndex = (
        activeIndex + direction + activeProject.gallery.length
      ) % activeProject.gallery.length;
      updateGallery();
    }

    byId("lab-feature-list").addEventListener("click", (event) => {
      const scrollButton = event.target.closest("[data-gallery-scroll]");
      if (scrollButton) {
        const rail = scrollButton.closest(".lab-gallery").querySelector(".lab-gallery-strip");
        const direction = Number(scrollButton.dataset.galleryScroll);
        rail.scrollBy({
          left: direction * Math.max(rail.clientWidth * 0.82, 300),
          behavior: "smooth",
        });
        return;
      }
      const button = event.target.closest(".lab-gallery-thumb");
      if (!button) return;
      activeProject = galleryProjects.get(button.dataset.projectId);
      activeIndex = Number(button.dataset.galleryIndex);
      updateGallery();
      dialog.showModal();
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog || event.target.closest("[data-gallery-close]")) {
        dialog.close();
      } else if (event.target.closest("[data-gallery-prev]")) {
        moveGallery(-1);
      } else if (event.target.closest("[data-gallery-next]")) {
        moveGallery(1);
      }
    });
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") moveGallery(-1);
      if (event.key === "ArrowRight") moveGallery(1);
    });
  }

  byId("lab-roadmap-content").innerHTML = `
    <h3>${escapeHtml(data.roadmap.title)}</h3>
    <div class="lab-roadmap-grid" style="margin-top:12px">
      ${data.roadmap.directions.map((direction, index) => `
        <section class="lab-roadmap-card" aria-label="방향 ${index + 1}. ${escapeHtml(direction.title)}">
          <h3>방향 ${index + 1}. ${escapeHtml(direction.title)}</h3>
          <p>${escapeHtml(direction.body)}</p>
          ${direction.links?.length ? `
            <div class="lab-link-row lab-roadmap-links">
              ${direction.links.map((link) => actionMarkup({
                label: `${link.label} 열기`,
                url: link.url,
              })).join("")}
            </div>
          ` : ""}
        </section>
      `).join("")}
    </div>
    <div class="lab-closing">
      ${data.roadmap.closing.map((text) => `<p>${escapeHtml(text)}</p>`).join("")}
    </div>
  `;

  byId("lab-org-list").innerHTML = `
    <section class="lab-org-block" aria-labelledby="lab-people-title">
      <h3 id="lab-people-title" class="lab-org-kicker">PEOPLE</h3>
      <div class="lab-people-list">
        ${data.organization.groups.map((group) => `
          <div class="lab-person-row${group.highlightName ? " is-highlighted" : ""}">
            <div class="role">${escapeHtml(group.role)}</div>
            <div class="names">
              ${group.names.split(" · ").map((name) => (
                `<span${name === group.highlightName ? ' class="person-highlight"' : ""}>${escapeHtml(name)}</span>`
              )).join('<span class="person-separator" aria-hidden="true"> · </span>')}
            </div>
          </div>
        `).join("")}
      </div>
    </section>
    <section class="lab-org-block" aria-labelledby="lab-projects-title">
      <h3 id="lab-projects-title" class="lab-org-kicker">PROJECTS</h3>
      <div class="lab-department-grid">
        ${data.organization.departments.map((department) => `
          <article class="lab-department-card tone-${escapeHtml(department.tone)}">
            <h4>${escapeHtml(department.title)}</h4>
            <div class="lab-department-lead">팀장: ${escapeHtml(department.lead)}</div>
            <p>${escapeHtml(department.body)}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
})();
