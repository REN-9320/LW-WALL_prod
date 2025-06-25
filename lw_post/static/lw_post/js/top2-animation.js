const screenWidth = window.innerWidth;
let completedAnimations = 0;
let animationStarted = false;
let animation_bpm = 60;
// アイテム要素を生成し、アニメーションを設定する関数


function createItemElement(content, seed_screen, seed_x) {
    const item = document.createElement('div');
    item.className = 'item';
    item.textContent = content;

    const randomX = window.innerWidth * (seed_screen - 1) + window.innerWidth * (seed_x / 5);
    item.style.left = `${randomX}px`;
    document.body.appendChild(item);

    // 粒子漏れを定期的に生成（このアイテム専用）
    const intervalId = setInterval(() => createParticles(item, false), 2000 * (60 / animation_bpm));

    // アニメーション終了時の処理
    item.addEventListener('animationend', () => {
        createParticles(item, true); // 最後の粒子

        setTimeout(() => {
            clearInterval(intervalId); // 粒子生成を止める
            item.remove();
            completedAnimations++;

            if (completedAnimations === items.length) {
                completedAnimations = 0;
                index = 0;
                setTimeout(showNextItem, 100);
            }
        }, 1000);
    });
}

const canvas = document.getElementsByClassName('all-container');

if (canvas.length > 0) {
    setInterval(() => {
        createUpperParticles(canvas[0]);
    }, 1000);
}

// パーティクルを生成する関数
function createParticles(item, isFinalBurst = false) {
    const particleCount = isFinalBurst ? 300 : 50;
    const particleContainer = document.getElementById('particle-container');

    if (!particleContainer) {
        console.error('Particle container not found');
        return;
    }

    const itemRect = item.getBoundingClientRect();
    const itemCenterX = itemRect.left + itemRect.width / 2 - particleContainer.getBoundingClientRect().left;
    const itemCenterY = itemRect.top + itemRect.height / 2 - particleContainer.getBoundingClientRect().top;

    const fragment = document.createDocumentFragment(); // フラグメントを使用して一度に追加

    const blur = ['blur(0px)', 'blur(1px)', 'blur(2px)'];
    const width = [2, 3, 4, 5, 6];
    const height = [2, 3, 4, 5, 6];

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        const xPosition = itemCenterX + (Math.random() - 0.5) * itemRect.width;
        const yPosition = itemCenterY + (Math.random() - 0.5) * itemRect.height;

        particle.style.left = `${xPosition}px`;
        particle.style.top = `${yPosition}px`;
        particle.style.width = `${width[Math.floor(Math.random() * width.length * 0.6)]}px`;
        particle.style.height = `${height[Math.floor(Math.random() * height.length * 0.6)]}px`;
        const particle_color = getRandomColor(isFinalBurst);
        particle.style.backgroundColor = particle_color.main;
        particle.style.boxShadow = particle_color.shadow;
        particle.style.filter = blur[Math.floor(Math.random() * blur.length * 0.75)];
        fragment.appendChild(particle);

        // パーティクルのアニメーション
        requestAnimationFrame(() => animateParticle(particle, isFinalBurst));
    }

    particleContainer.appendChild(fragment); // 一度に追加
}

// パーティクルのアニメーションを設定する関数
function animateParticle(particle, isFinalBurst) {
    const duration = isFinalBurst ? Math.random() * 4 + 1 : Math.random() * 1 + 1;
    const randomX = (Math.random() - 0.5) * 60;
    const randomY = isFinalBurst ? Math.random() * -100 : (Math.random() - 0.5) * 60;

    const turbulence = getTurbulenceEffect(particle, isFinalBurst);

    particle.animate([
        { transform: 'translate(0, 0)', opacity: 1, offset: 0 },
        { transform: `translate(${randomX + turbulence.x}px, ${randomY + turbulence.y}px)`, opacity: 0.9, offset: 0.3 },
        { transform: `translate(${randomX}px, ${randomY + turbulence.Final_y}px)`, opacity: 0.5, offset: 0.7 },
        { transform: `translate(${randomX}px, ${randomY + turbulence.Final_y}px)`, opacity: 0, offset: 1 }
      ], {
        duration: duration * 2000 + 100,
        easing: 'ease-out',
        fill: 'forwards'
    });

    setTimeout(() => {
        particle.remove();
    }, duration * 2000 + 100);
}

// 乱流の影響を計算する関数
function getTurbulenceEffect(particle, isFinalBurst) {
    const dx = (Math.random() - 0.5) * 100; // 乱流によるX方向の変化
    const dy = isFinalBurst ? (Math.random() - 1) * 300 : (Math.random() - 0.5) * 60; // 乱流によるY方向の変化
    const Final_y = isFinalBurst ? (Math.random() - 1) * 300 : 0;
    return { x: dx, y: dy, Final_y: Final_y };
}

// 最後の分散は白、それ以外はランダムに赤・青・白
function getRandomColor(isFinalBurst) {
    if (isFinalBurst) {
        const colors = ['#FF6673', '#66CFFF', '#FFD433']; // 赤、青、白
        return colors[Math.floor(Math.random() * colors.length)];
    } else {
        const colors = ['#FF6673', '#66CFFF', '#FFD433']; // 赤、青、白
        const fixed_color = colors[Math.floor(Math.random() * colors.length * 0.8)];
        const shadow_color = fixed_color == '#FF6673' ? '0px 0px 10px #FF6673' : fixed_color == '#66CFFF' ? '0px 0px 10px #66CFFF' : '0px 0px 10px #FFD433';
        return { main: fixed_color, shadow: shadow_color };
    }
}

// パーティクルを生成する関数
function createUpperParticles(canvasEl) {
    const particleCount = 100;

    const itemRect = canvasEl.getBoundingClientRect();
    const itemCenterX = itemRect.width / 2;
    const itemCenterY = itemRect.height / 2;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        const xPosition = itemCenterX + (Math.random() - 0.5) * itemRect.width;
        const yPosition = itemRect.height * 0.05 + (Math.random() - 0.5) * itemRect.height * 0.05;

        particle.style.left = `${xPosition}px`;
        particle.style.top = `${yPosition}px`;
        particle.style.width = '5px';
        particle.style.height = '5px';

        const particle_color = getRandomColor(false);
        particle.style.backgroundColor = particle_color.main;
        particle.style.boxShadow = particle_color.shadow;
        particle.style.filter = 'blur(1px)';

        canvasEl.appendChild(particle);
        animateUpperParticle(particle);

        // 💡 DOMノード数制限（400超えたら古いもの削除）
        const existingParticles = document.querySelectorAll('.particle');
        if (existingParticles.length > 300) {
            for (let i = 0; i < 50; i++) {
                if (existingParticles[i]) existingParticles[i].remove();
            }
        }
    }
}

// パーティクルのアニメーションを設定する関数
function animateUpperParticle(particle) {
    const duration = Math.random() * 2 + 1; // パーティクルが分解される時間
    const randomX = (Math.random() - 0.5) * 60; // ランダムなX方向の動き
    const randomY = (Math.random() - 0.5) * 60;  // ランダムなY方向の動き

    // 乱流の影響を追加
    const turbulence = getTurbulenceEffect(particle, false);

    particle.animate([
        { transform: 'translate(0, 0)', opacity: 1 },
        { transform: `translate(${randomX + turbulence.x}px, ${randomY + turbulence.y}px)`, opacity: 0.6 },
        { transform: `translate(${randomX}px, -200px)`, opacity: 0.2 }
    ], {
        duration: duration * 1000,
        easing: 'ease-out',
        fill: 'forwards'
    });

    // アニメーション終了後にパーティクルを削除
    setTimeout(() => {
        particle.remove();
    }, duration * 2000);
}

let index = 0;
// アイテムを順に表示する関数
function showNextItem() {
    if (index < items.length) {
        createItemElement(items[index].lastwords, items[index].seed_screen, items[index].seed_x);
        index++;
        nextItemFrame = setTimeout(() => requestAnimationFrame(showNextItem), 2000);
    }
}

