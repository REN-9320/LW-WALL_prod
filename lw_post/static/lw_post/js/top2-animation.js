const screenWidth = window.innerWidth;
let completedAnimations = 0;

// アイテム要素を生成し、アニメーションを設定する関数


function createItemElement(content, seed_screen, seed_x) {

    const item = document.createElement('div');
    item.className = 'item';
    item.textContent = content;
    // アイテムの横位置をランダムに設定
    const randomX = window.innerWidth * (seed_screen - 1) + window.innerWidth * (seed_x / 5);

    item.style.left = `${randomX}px`;
    // アイテムをドキュメントに追加
    document.body.appendChild(item);

    const canvas = document.getElementsByClassName('all-container');

    // アニメーション中の粒子漏れを定期的に生成（1分間）
    const intervalId = setInterval(() => createParticles(item, false), 1000); // 100ミリ秒ごとに漏れ出す

    setInterval(() => {
        createUpperParticles(canvas);
        console.log('upper particles');
    }, 1000);

    // アニメーション終了時にパーティクルを生成
    item.addEventListener('animationend', () => {
        // アニメーション終了時に粒子生成を止める
        
        createParticles(item, true); // 最後の粒子生成

        // 粒子生成後にアイテムを削除する前に、1分間待つ
        setTimeout(() => {
            clearInterval(intervalId);
            item.remove();
            completedAnimations++;

            if (completedAnimations === items.length) {
                // リセットして再実行
                completedAnimations = 0;
                index = 0;
                setTimeout(showNextItem, 500); // 少し間を空けて再実行
            }
        }, 1000); // 10秒間待つ
    });
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
        { transform: 'translate(0, 0)', opacity: 1 },
        { transform: `translate(${randomX + turbulence.x}px, ${randomY + turbulence.y}px)`, opacity: 0.6 },
        { transform: `translate(${randomX}px, ${randomY + turbulence.Final_y}px)`, opacity: 0.2 }
    ], {
        duration: duration * 1000,
        easing: 'ease-out',
        fill: 'forwards'
    });

    setTimeout(() => {
        particle.remove();
    }, duration * 2000);
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
function createUpperParticles(canvas) {
    console.log(canvas);
    const particleCount = 80; // パーティクルの数

    // アイテムの位置を基にしてパーティクルを生成し、同じ位置から分解するように配置
    const itemRect = canvas[0].getBoundingClientRect();

    const itemCenterX = itemRect.left + itemRect.width / 2 - canvas[0].getBoundingClientRect().left;
    const itemCenterY = itemRect.top + itemRect.height / 2 - canvas[0].getBoundingClientRect().top;

    // パーティクルを生成し、パーティクルコンテナに追加
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const xPosition = itemCenterX + (Math.random() - 0.5) * itemRect.width;
        const yPosition = itemRect.height * 0.05 + (Math.random() - 0.5) * itemRect.height * 0.05;

        const blur = ['blur(0px)', 'blur(2px)', 'blur(6px)'];
        const width = [4, 5, 6, 7, 8, 9, 10];
        const height = [4, 5, 6, 7, 8, 9, 10];

        particle.style.left = `${xPosition}px`;
        particle.style.top = `${yPosition}px`;
        particle.style.width = `${width[Math.floor(Math.random() * width.length * 0.6)]}px`;
        particle.style.height = `${height[Math.floor(Math.random() * height.length * 0.6)]}px`;
        const particle_color = getRandomColor(false);
        particle.style.backgroundColor = particle_color.main;
        particle.style.boxShadow = particle_color.shadow;
        particle.style.filter = blur[Math.floor(Math.random() * blur.length + 0.2)];
        canvas[0].appendChild(particle);

        // パーティクルのアニメーション
        animateUpperParticle(particle);
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
        setTimeout(showNextItem, 700);
    }
}

// アニメーションを開始
showNextItem();
