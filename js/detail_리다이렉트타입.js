/* ========================================= 리다이렉트타입 ========================================= */

let currentPokemonId = null;

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// 페이지 로드 시 데이터 가져오기
document.addEventListener('DOMContentLoaded', () => {
    currentPokemonId = getQueryParam('id');
    //console.log(currentPokemonId);

    document.querySelector('.detail_container .loading_spinner').classList.add('on');
    getDetailPokemonData(currentPokemonId).then((response) => {
        document.querySelector('.detail_container .loading_spinner').classList.remove('on');
        displayRender(response);
    });
});

// 포켓몬 정보를 가져오는 함수
async function getDetailPokemonData(prmId) {
    try {
        const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${prmId}`;
        const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${prmId}`;

        // 포켓몬 기본 정보와 종 정보 가져오기
        const [pokemonResponse, speciesResponse] = await Promise.all([fetch(pokemonUrl), fetch(speciesUrl)]);
        const pokemonDetail = await pokemonResponse.json();
        const speciesDetail = await speciesResponse.json();

        // 능력과 타입의 URL들을 모두 모아서 한 번에 fetch 하기 위한 배열 생성
        const abilitiesFetches = pokemonDetail.abilities.map((abilityInfo) => fetch(abilityInfo.ability.url));
        const typesFetches = pokemonDetail.types.map((typeInfo) => fetch(typeInfo.type.url));

        // abilities와 types를 병렬로 처리
        const [abilitiesResponses, typesResponses] = await Promise.all([Promise.all(abilitiesFetches), Promise.all(typesFetches)]);

        // 능력 정보 파싱 및 한글 이름/설명 추출
        const abilities = await Promise.all(
            abilitiesResponses.map(async (response) => {
                const abilityDetail = await response.json();
                const abilityName = abilityDetail.names.find((item) => item.language.name === 'ko')?.name || '번역없음';
                const abilityDescription = abilityDetail.flavor_text_entries.find((item) => item.language.name === 'ko')?.flavor_text || '번역없음';
                return `${abilityName}: ${abilityDescription}`;
            })
        );

        // 타입 정보 파싱 및 한글/영문 이름 추출
        const types = await Promise.all(
            typesResponses.map(async (response) => {
                const typeDetail = await response.json();
                const koreanName = typeDetail.names.find((name) => name.language.name === 'ko')?.name || '번역없음';
                const englishName = typeDetail.names.find((name) => name.language.name === 'en')?.name || 'No English Name';
                return { ko: koreanName, en: englishName };
            })
        );

        // 종 한글 이름 및 설명 추출
        const koreanName = speciesDetail.names.find((name) => name.language.name === 'ko')?.name || '번역없음';
        const koreanDescription = speciesDetail.flavor_text_entries.find((entry) => entry.language.name === 'ko')?.flavor_text || '번역없음';

        // 높이, 무게 변환
        const heightInCm = pokemonDetail.height * 10; // dm를 cm로 변환
        const weightInKg = pokemonDetail.weight / 10; // hg를 kg로 변환

        // 필요한 데이터 반환
        return {
            name: koreanName,
            id: pokemonDetail.id,
            image: pokemonDetail.sprites.other['official-artwork'].front_default,
            description: koreanDescription,
            abilities: abilities,
            types: types,
            height: `${pokemonDetail.height} dm (${heightInCm} cm)`,
            weight: `${pokemonDetail.weight} hg (${weightInKg} kg)`,
        };
    } catch (error) {
        console.error('Error fetching Pokémon data:', error);
    }
}

function displayRender(responsePokemonData) {
    // console.log(responsePokemonData);
    const eleMonName = document.querySelector('#monName');
    const eleMonNumber = document.querySelector('#monNumber');
    const eleMonImage = document.querySelector('#monImage');
    const eleMonSummary = document.querySelector('#monSummary');
    const eleMonAbility = document.querySelector('#monAbility');
    const eleMonTypes = document.querySelector('#monTypes');
    const eleMonHeight = document.querySelector('#monHeight');
    const eleMonWeight = document.querySelector('#monWeight');

    eleMonName.textContent = '';
    eleMonNumber.textContent = '';
    eleMonImage.setAttribute('src', '');
    eleMonSummary.textContent = '';
    eleMonAbility.textContent = '';
    eleMonTypes.textContent = '';
    eleMonHeight.textContent = '';
    eleMonWeight.textContent = '';

    eleMonName.textContent = responsePokemonData.name;
    eleMonNumber.textContent = 'No.' + responsePokemonData.id;
    eleMonImage.setAttribute('src', responsePokemonData.image);
    eleMonSummary.textContent = responsePokemonData.description;
    eleMonAbility.innerHTML = responsePokemonData.abilities.map((item) => `<p>${item}</p>`).join('');
    eleMonTypes.textContent = responsePokemonData.types.map((item) => item.ko).join(',');
    eleMonHeight.textContent = responsePokemonData.height;
    eleMonWeight.textContent = responsePokemonData.weight;

    //타입에 대한 색상값
    const typeColors = {
        normal: '#A8A878',
        fire: '#F08030',
        water: '#6890F0',
        electric: '#F8D030',
        grass: '#78C850',
        ice: '#98D8D8',
        fighting: '#C03028',
        poison: '#A040A0',
        ground: '#E0C068',
        flying: '#A890F0',
        psychic: '#F85888',
        bug: '#A8B820',
        rock: '#B8A038',
        ghost: '#705898',
        dragon: '#7038F8',
        dark: '#705848',
        steel: '#B8B8D0',
        dark: '#EE99AC',
    };
    function setElementStyles(elements, cssProperty, value) {
        elements.forEach((element) => {
            element.style[cssProperty] = value;
        });
    }

    const mainType = responsePokemonData.types[0].en.toLowerCase();
    const typeColor = typeColors[mainType];

    const ele = document.querySelectorAll('.detail_top');
    setElementStyles(ele, 'background-color', typeColor);
}

// prev next btn =============================================
const prevBtn = document.querySelector('.prev_btn');
const nextBtn = document.querySelector('.next_btn');
prevBtn.addEventListener('click', () => {
    currentPokemonId = Number(currentPokemonId) - 1;
    if (currentPokemonId === 0) currentPokemonId = 1025;
    location.href = `detail.html?id=${currentPokemonId}`;
});
nextBtn.addEventListener('click', () => {
    currentPokemonId = Number(currentPokemonId) + 1;
    if (currentPokemonId > 1025) currentPokemonId = 1;
    location.href = `detail.html?id=${currentPokemonId}`;
});

//home btn ===================================================
const homeBtn = document.querySelector('.home_btn');
homeBtn.addEventListener('click', () => {
    location.href = `index.html`;
});
