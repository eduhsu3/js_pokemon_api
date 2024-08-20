/* ========================================= 캐시타입 ========================================= */

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
// 캐시를 저장할 객체를 선언합니다.
const cache = {};

// 캐시를 사용하는 fetch 함수
async function fetchWithCache(url) {
    // 캐시에 해당 URL의 데이터가 있는지 확인합니다.
    if (cache[url]) {
        return cache[url]; // 캐시된 데이터를 반환합니다.
    }
    // 캐시에 없으면 데이터를 fetch합니다.
    const response = await fetch(url);
    const data = await response.json();
    cache[url] = data; // 데이터를 캐시에 저장합니다.
    return data;
}

// 특정 포켓몬의 상세 데이터를 가져오는 함수
async function getDetailPokemonData(prmId) {
    try {
        // 포켓몬과 종(species)의 API URL을 생성합니다.
        const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${prmId}`;
        const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${prmId}`;

        // 포켓몬과 종 데이터를 병렬로 요청하여 성능을 최적화합니다.
        const [pokemonDetail, speciesDetail] = await Promise.all([fetchWithCache(pokemonUrl), fetchWithCache(speciesUrl)]);

        // abilities와 types 병렬 처리
        const [abilities, types] = await Promise.all([
            // 포켓몬의 능력(abilities)을 병렬로 가져옵니다.
            Promise.all(
                pokemonDetail.abilities.map(async (abilityInfo) => {
                    const abilityDetail = await fetchWithCache(abilityInfo.ability.url);
                    const abilityName = abilityDetail.names.find((item) => item.language.name === 'ko')?.name || '번역없음';
                    const abilityDescription = abilityDetail.flavor_text_entries.find((item) => item.language.name === 'ko')?.flavor_text || '번역없음';
                    return `${abilityName}: ${abilityDescription}`;
                })
            ),
            // 포켓몬의 타입(types)을 병렬로 가져옵니다.
            Promise.all(
                pokemonDetail.types.map(async (typeInfo) => {
                    const typeDetail = await fetchWithCache(typeInfo.type.url);
                    const koreanName = typeDetail.names.find((name) => name.language.name === 'ko')?.name || '번역없음';
                    const englishName = typeDetail.names.find((name) => name.language.name === 'en')?.name || 'No English Name';
                    return { ko: koreanName, en: englishName };
                })
            ),
        ]);

        // 포켓몬의 한국어 이름을 가져옵니다.
        const koreanName = speciesDetail.names.find((name) => name.language.name === 'ko')?.name || '번역없음';
        // 포켓몬의 한국어 설명을 가져옵니다.
        const koreanDescription = speciesDetail.flavor_text_entries.find((entry) => entry.language.name === 'ko')?.flavor_text || '번역없음';

        // 키와 몸무게를 적절한 단위로 변환합니다.
        const heightInCm = pokemonDetail.height * 10; // dm를 cm로 변환
        const weightInKg = pokemonDetail.weight / 10; // hg를 kg로 변환

        // 최종 데이터를 반환합니다.
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
        // 에러 발생 시 콘솔에 로그를 남깁니다.
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

    document.querySelector('.detail_container .loading_spinner').classList.add('on');
    getDetailPokemonData(currentPokemonId).then((response) => {
        const newUrl = `${window.location.pathname}?id=${currentPokemonId}`;
        window.history.pushState({ id: currentPokemonId }, '', newUrl);
        document.querySelector('.detail_container .loading_spinner').classList.remove('on');
        displayRender(response);
    });
});
nextBtn.addEventListener('click', () => {
    currentPokemonId = Number(currentPokemonId) + 1;
    if (currentPokemonId > 1025) currentPokemonId = 1;

    console.log('next');
    document.querySelector('.detail_container .loading_spinner').classList.add('on');
    getDetailPokemonData(currentPokemonId).then((response) => {
        const newUrl = `${window.location.pathname}?id=${currentPokemonId}`;
        window.history.pushState({ id: currentPokemonId }, '', newUrl);
        document.querySelector('.detail_container .loading_spinner').classList.remove('on');
        displayRender(response);
    });
});

//home btn ===================================================
const homeBtn = document.querySelector('.home_btn');
homeBtn.addEventListener('click', () => {
    location.href = `index.html`;
});
