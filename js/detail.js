let currentPokemonId = null;

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// 페이지 로드 시 데이터 가져오기
document.addEventListener('DOMContentLoaded', () => {
    currentPokemonId = getQueryParam('id');
    console.log(currentPokemonId);

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

        const [pokemonResponse, speciesResponse] = await Promise.all([fetch(pokemonUrl), fetch(speciesUrl)]);
        const pokemonDetail = await pokemonResponse.json();
        const speciesDetail = await speciesResponse.json();

        // species url로 가서 종 한글 이름 과 종 설명 가져오기
        const koreanName = speciesDetail.names.find((name) => name.language.name === 'ko')?.name || '번역없음';
        const koreanDescription = speciesDetail.flavor_text_entries.find((entry) => entry.language.name === 'ko')?.flavor_text || '번역없음';

        // ability url로 가서 능력 한글이름 과 설명 가져오기
        const abilitiesPromises = pokemonDetail.abilities.map(async (abilityInfo) => {
            console.log(pokemonDetail.abilities.length);
            const abilityResponse = await fetch(abilityInfo.ability.url);
            const abilityDetail = await abilityResponse.json();

            // 능력 한글제목 과 능력 설명 가져오기
            const abilityName = abilityDetail.names.find((item) => item.language.name === 'ko')?.name || '번역없음';
            const abilityDescription = abilityDetail.flavor_text_entries.find((item) => item.language.name === 'ko')?.flavor_text || '번역없음';

            return `${abilityName}: ${abilityDescription}`;
        });
        const abilities = await Promise.all(abilitiesPromises);

        //타입 url로 가서 타입 한글 이름 가져오기
        const typesPromises = pokemonDetail.types.map(async (typeInfo) => {
            const typeResponse = await fetch(typeInfo.type.url);
            const typeDetail = await typeResponse.json();
            //console.log('타입', typeDetail);

            // 타입(types) 한글, 영문 각가 가져오기
            const koreanName = typeDetail.names.find((name) => name.language.name === 'ko').name;
            const englishName = typeDetail.names.find((name) => name.language.name === 'en').name;
            return {
                ko: koreanName, // ko :['불','독']
                en: englishName, // en : ['fire','danger']
            };
        });
        //console.log(typesPromises);
        const types = await Promise.all(typesPromises);

        // 높이, 무게 가져와서 치수 변경
        const heightInCm = pokemonDetail.height * 10; // dm를 cm로 변환
        const weightInKg = pokemonDetail.weight / 10; // hg를 kg로 변환

        // ============================================ 필요한 데이터 정리
        // ============================================ 필요한 데이터 정리
        // ============================================ 필요한 데이터 정리
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
    console.log(responsePokemonData);
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
    eleMonNumber.textContent = responsePokemonData.id;
    eleMonImage.setAttribute('src', responsePokemonData.image);
    eleMonSummary.textContent = responsePokemonData.description;
    eleMonAbility.textContent = responsePokemonData.abilities;
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
