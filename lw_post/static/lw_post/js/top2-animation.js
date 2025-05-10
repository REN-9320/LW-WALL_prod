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

    // アニメーション中の粒子漏れを定期的に生成
    const intervalId = setInterval(() => createParticles(item, false), 100); // 700ミリ秒ごとに漏れ出す

    // アニメーション終了時にパーティクルを生成
    item.addEventListener('animationend', () => {
        // アニメーション終了時に粒子生成を止める
        clearInterval(intervalId);
        createParticles(item, true); // 最後の粒子生成

        // 粒子生成後にアイテムを削除
        setTimeout(() => item.remove(), 0);
        completedAnimations++;

        if (completedAnimations === items.length) {
            // リセットして再実行
            completedAnimations = 0;
            index = 0;
            setTimeout(showNextItem, 2000); // 少し間を空けて再実行
        }
    });
}

// パーティクルを生成する関数
function createParticles(item, isFinalBurst = false) {
    const particleCount = isFinalBurst ? 30 : 2; // パーティクルの数
    const particleContainer = document.getElementById('particle-container');

    // パーティクルコンテナが存在するか確認
    if (!particleContainer) {
        console.error('Particle container not found');
        return;
    }

    // アイテムの位置を基にしてパーティクルを生成し、同じ位置から分解するように配置
    const itemRect = item.getBoundingClientRect();

    const itemCenterX = itemRect.left + itemRect.width / 2 - particleContainer.getBoundingClientRect().left;
    const itemCenterY = itemRect.top + itemRect.height / 2 - particleContainer.getBoundingClientRect().top;

    // パーティクルを生成し、パーティクルコンテナに追加
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const xPosition = itemCenterX + (Math.random() - 0.5) * itemRect.width;
        const yPosition = itemCenterY + (Math.random() - 0.5) * itemRect.height;

        particle.style.left = `${xPosition}px`;
        particle.style.top = `${yPosition}px`;
        particle.style.backgroundColor = getRandomColor(isFinalBurst);
        particleContainer.appendChild(particle);

        // パーティクルのアニメーション
        animateParticle(particle, isFinalBurst);
    }
}

// パーティクルのアニメーションを設定する関数
function animateParticle(particle, isFinalBurst) {
    const duration = Math.random() * 1.5 + 1; // パーティクルが分解される時間
    const randomX = (Math.random() - 0.5) * 50; // ランダムなX方向の動き
    const randomY = isFinalBurst ? Math.random() * -100 : (Math.random() - 0.5) * 100;  // ランダムなY方向の動き

    particle.animate([
        { transform: 'translate(0, 0)', opacity: 1 },
        { transform: `translate(${randomX}px, ${randomY}px)`, opacity: 0 }
    ], {
        duration: duration * 1000,
        easing: 'ease-out',
        fill: 'forwards'
    });

    // アニメーション終了後にパーティクルを削除
    setTimeout(() => {
        particle.remove();
    }, duration * 1000);
}

// 最後の分散は白、それ以外はランダムに赤・青・白
function getRandomColor(isFinalBurst) {
    if (isFinalBurst) {
        return '#FFFFFF';
    } else {
        const colors = ['#FF0000', '#0000FF', '#FFFFFF']; // 赤、青、白
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

let index = 0;
// アイテムを順に表示する関数
function showNextItem() {
    if (index < items.length) {
        createItemElement(items[index].lastwords, items[index].seed_screen, items[index].seed_x);
        index++;
        setTimeout(showNextItem, 5000);
    }
}

// アニメーションを開始
showNextItem();
