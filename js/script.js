// 포켓몬 정보를 가져오는 함수
async function getPokemonData(prmType) {
    let baseUrl = 'https://pokeapi.co/api/v2/pokemon?limit=20';
    if (prmType === 'search') {
        baseUrl = 'https://pokeapi.co/api/v2/pokemon?limit=380';
    }

    try {
        const response = await fetch(baseUrl);
        const firstData = await response.json();

        const pokemonDataPromises = firstData.results.map(async (item) => {
            const pokemonUrl = item.url;
            const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${item.name}`;

            const [pokemonResponse, speciesResponse] = await Promise.all([fetch(pokemonUrl), fetch(speciesUrl)]);
            const pokemonDetail = await pokemonResponse.json();
            const speciesDetail = await speciesResponse.json();

            const koreanName = speciesDetail.names.find((name) => name.language.name === 'ko').name;

            return {
                name: koreanName,
                id: pokemonDetail.id,
                image: pokemonDetail.sprites.other['official-artwork'].front_default,
            };
        });

        return await Promise.all(pokemonDataPromises);
    } catch (error) {
        console.error('Error fetching Pokémon data:', error);
    }
}

// 페이지 로드 시 데이터 가져오기
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.mon_main .loading_spinner').classList.add('on');
    getPokemonData().then((response) => {
        document.querySelector('.mon_main .loading_spinner').classList.remove('on');
        renderPokemonList(response);
    });
});

// 데이터를 화면에 출력하는 함수
function renderPokemonList(prmArrayData) {
    const eleListWrap = document.querySelector('#listWrap');
    prmArrayData.forEach((item, idx) => {
        const eleDiv = document.createElement('div');
        eleDiv.id = item.id;
        eleDiv.className = 'item_box';
        eleDiv.innerHTML = `
            <p>${item.name}</p>
            <img src="${item.image}" alt="" />`;

        eleListWrap.appendChild(eleDiv);

        // 클릭시 모달열기
        eleDiv.addEventListener('click', function (e) {
            document.querySelector('body').classList.add('fixed');
            document.querySelector('.modal_inner .loading_spinner').classList.add('on');
            renderModalData(e.currentTarget.id);
        });
    });
}

//=====모달 닫기
document.querySelector('#closeModal').addEventListener('click', function () {
    document.querySelector('body').classList.remove('fixed');
});
document.querySelector('.modal_bg_wrap').addEventListener('click', function () {
    document.querySelector('body').classList.remove('fixed');
});

//=====모달 inner 이벤트 전달끊기
document.querySelector('.modal_inner').addEventListener('click', function (e) {
    e.stopPropagation();
});

function renderModalData(prmId) {
    const eleMonName = document.querySelector('#monName');
    const eleMonNumber = document.querySelector('#monNumber');
    const eleMonImage = document.querySelector('#monImage');
    const eleMonSummary = document.querySelector('#monSummary');
    const eleMonAbility = document.querySelector('#monAbility');
    const eleMonTypes = document.querySelector('#monTypes');
    const eleMonHeight = document.querySelector('#monHeight');
    const eleMonWeight = document.querySelector('#monWeight');
    const eleDetailViewBtn = document.querySelector('#detailViewBtn');

    eleMonName.textContent = '';
    eleMonNumber.textContent = '';
    eleMonImage.setAttribute('src', '');
    eleMonSummary.textContent = '';
    eleMonAbility.textContent = '';
    eleMonTypes.textContent = '';
    eleMonHeight.textContent = '';
    eleMonWeight.textContent = '';

    getModalPokemonData(prmId).then((response) => {
        if (response) {
            document.querySelector('.modal_inner .loading_spinner').classList.remove('on');
            eleMonName.textContent = response.name;
            eleMonNumber.textContent = response.id;
            eleMonImage.setAttribute('src', response.image);
            eleMonSummary.textContent = response.description;
            eleMonAbility.textContent = response.abilities;
            eleMonTypes.textContent = response.types;
            eleMonHeight.textContent = response.height;
            eleMonWeight.textContent = response.weight;

            eleDetailViewBtn.addEventListener('click', function () {
                location.href = `detail.html?id=${response.id}`;
            });
        }
    });
}

//==================================
//==================================
//==================================
//==================================
//==================================
async function getModalPokemonData(prmId) {
    try {
        const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${prmId}`;
        const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${prmId}`;

        const [pokemonResponse, speciesResponse] = await Promise.all([fetch(pokemonUrl), fetch(speciesUrl)]);
        const pokemonDetail = await pokemonResponse.json();
        const speciesDetail = await speciesResponse.json();

        // species url로 가서 종 한글 이름 과 종 설명 가져오기
        const koreanName = speciesDetail.names.find((name) => name.language.name === 'ko').name;
        const koreanDescription = speciesDetail.flavor_text_entries.find((entry) => entry.language.name === 'ko').flavor_text;

        // ability url로 가서 능력 한글이름 과 설명 가져오기
        const abilitiesPromises = pokemonDetail.abilities.map(async (abilityInfo) => {
            console.log(pokemonDetail.abilities.length);
            const abilityResponse = await fetch(abilityInfo.ability.url);
            const abilityDetail = await abilityResponse.json();

            // 능력 한글제목 과 능력 설명 가져오기
            const abilityName = abilityDetail.names.find((name) => name.language.name === 'ko').name;
            const abilityDescription = abilityDetail.flavor_text_entries.find((entry) => entry.language.name === 'ko').flavor_text;

            return `${abilityName}: ${abilityDescription}`;
        });
        const abilities = await Promise.all(abilitiesPromises);

        //타입 url로 가서 타입 한글 이름 가져오기
        const typesPromises = pokemonDetail.types.map(async (typeInfo) => {
            const typeResponse = await fetch(typeInfo.type.url);
            const typeDetail = await typeResponse.json();
            //console.log('타입', typeDetail);

            // 타입(types) 한글 데이터 가져오기
            return typeDetail.names.find((name) => name.language.name === 'ko').name;
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

//=================search======================================================================
const eleSchBtn = document.querySelector('#submitBtn');
const eleSchInput = document.querySelector('#inputSearch');

function onSearchHandler(e) {
    searchKeyword = eleSchInput.value.trim().toLowerCase();
    if (searchKeyword === '') eleSchInput.value = '';

    //============== 검색 실행시 가져오기 ===============================
    document.querySelector('#listWrap').innerHTML = '';
    document.querySelector('.mon_main .loading_spinner').classList.add('on');

    getPokemonData('search').then((response) => {
        const filteredArray = response.filter((item) => {
            return item.name.includes(searchKeyword);
        });
        console.log('검색값 : ', filteredArray);
        document.querySelector('.mon_main .loading_spinner').classList.remove('on');
        renderPokemonList(filteredArray);
    });
}

eleSchBtn.addEventListener('click', function () {
    onSearchHandler();
});
eleSchInput.addEventListener('keyup', function (e) {
    if (e.key === 'Enter') {
        onSearchHandler();
    }
});

//=================search reset======================================================================
/*  const eleSchResetBtn = document.querySelector('#schResetBtn');
    eleSchResetBtn.addEventListener('click', () => {
        eleSchInput.value = '';
        searchKeyword = '';
        limit = 10;
        loadPost();
    }); */
