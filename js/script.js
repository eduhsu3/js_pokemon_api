// 포켓몬 정보를 가져오는 함수
async function getPokemonData() {
    const baseUrl = 'https://pokeapi.co/api/v2';
    const pokemonLimit = 20; // 가져올 포켓몬 수

    try {
        // 11111111111. 기본 포켓몬 리스트 가져오기
        // 11111111111. 기본 포켓몬 리스트 가져오기
        // 11111111111. 기본 포켓몬 리스트 가져오기
        const response = await fetch(`${baseUrl}/pokemon?limit=${pokemonLimit}`);
        const data = await response.json();
        const pokemonList = data.results;
        //console.log('1번 : ', pokemonList)     // ------------------------------------------------------------통신 결과 -> 포켓몬 20개의 기본 정보를 배열로 보관;

        // 22222222222. 포켓몬 상세 정보 가져오기
        // 22222222222. 포켓몬 상세 정보 가져오기
        // 22222222222. 포켓몬 상세 정보 가져오기
        const pokemonDataPromises = pokemonList.map(async (item) => {
            const pokemonDetailResponse = await fetch(item.url);
            const pokemonDetail = await pokemonDetailResponse.json();
            //console.log('2번 : ', pokemonDetail);   // -------------------------------------------------------통신 결과 -> 20번 각각 반복하면서 --> 개별 상세정보 url 로 통신하고 -->  결과를 객체로 보관

            // ========================================== 종(species)의 상세정보 url로 통신 후 포켓몬 한글명과 한글 종설명 가져오기
            // ========================================== 종(species)의 상세정보 url로 통신 후 포켓몬 한글명과 한글 종설명 가져오기
            // ========================================== 종(species)의 상세정보 url로 통신 후 포켓몬 한글명과 한글 종설명 가져오기
            const speciesResponse = await fetch(pokemonDetail.species.url);
            const speciesDetail = await speciesResponse.json();

            // 종에 대한 한글 이름 과 종 설명 가져오기
            const koreanName = speciesDetail.names.find((name) => name.language.name === 'ko').name;
            const koreanDescription = speciesDetail.flavor_text_entries.find((entry) => entry.language.name === 'ko').flavor_text;

            // =========================================== 능력(abilities)의 상세정보 url로 통신 후 한글 능력명과 한글 능력 설명 가져오기
            // =========================================== 능력(abilities)의 상세정보 url로 통신 후 한글 능력명과 한글 능력 설명 가져오기
            // =========================================== 능력(abilities)의 상세정보 url로 통신 후 한글 능력명과 한글 능력 설명 가져오기
            const abilitiesPromises = pokemonDetail.abilities.map(async (abilityInfo) => {
                const abilityResponse = await fetch(abilityInfo.ability.url);
                const abilityDetail = await abilityResponse.json();

                // 능력 한글제목 과 능력 설명 가져오기
                const abilityName = abilityDetail.names.find((name) => name.language.name === 'ko').name;
                const abilityDescription = abilityDetail.flavor_text_entries.find((entry) => entry.language.name === 'ko').flavor_text;

                return `${abilityName}: ${abilityDescription}`;
            });
            const abilities = await Promise.all(abilitiesPromises);
            //console.log('능력출력 : ', abilities);

            // ============================================ 타입(types)의 상세정보 url로 통신 후 한글 타입명 가져오기
            // ============================================ 타입(types)의 상세정보 url로 통신 후 한글 타입명 가져오기
            // ============================================ 타입(types)의 상세정보 url로 통신 후 한글 타입명 가져오기
            const typesPromises = pokemonDetail.types.map(async (typeInfo) => {
                const typeResponse = await fetch(typeInfo.type.url);
                const typeDetail = await typeResponse.json();
                //console.log('타입', typeDetail);

                // 타입(types) 한글 데이터 가져오기
                return typeDetail.names.find((name) => name.language.name === 'ko').name;
            });
            //console.log(typesPromises);
            const types = await Promise.all(typesPromises);

            // ============================================ 높이와 무게 변환
            // ============================================ 높이와 무게 변환
            // ============================================ 높이와 무게 변환
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
        });

        // 3333333333. 모든 포켓몬의 데이터를 병렬로 가져오기
        // 3333333333. 모든 포켓몬의 데이터를 병렬로 가져오기
        // 3333333333. 모든 포켓몬의 데이터를 병렬로 가져오기
        const pokemonArrayData = await Promise.all(pokemonDataPromises);
        //console.log('최종 : ', pokemonArrayData);
        return pokemonArrayData;
        // 4444444444. 데이터를 화면에 출력
        // 4444444444. 데이터를 화면에 출력
        // 4444444444. 데이터를 화면에 출력

        //renderPokemonList(pokemonArrayData);
    } catch (error) {
        console.error('Error fetching Pokémon data:', error);
    }
}

// 페이지 로드 시 데이터 가져오기
document.addEventListener('DOMContentLoaded', () => {
    getPokemonData().then((response) => {
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

        eleDiv.addEventListener('click', function (e) {
            currentID = e.currentTarget.id;

            //=====모달열기
            document.querySelector('body').classList.add('fixed');

            document.querySelector('#monName').textContent = item.name;
            document.querySelector('#monNumber').textContent = item.id;
            document.querySelector('#monImage').setAttribute('src', item.image);
            document.querySelector('#monSummary').textContent = item.description;
            document.querySelector('#monAbility').textContent = item.abilities;
            document.querySelector('#monTypes').textContent = item.types;
            document.querySelector('#monHeight').textContent = item.height;
            document.querySelector('#monWeight').textContent = item.weight;
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

//=====모달 inner
document.querySelector('.modal_inner').addEventListener('click', function (e) {
    e.stopPropagation();
});

//=================search======================================================================
const eleSchBtn = document.querySelector('#submitBtn');
const eleSchInput = document.querySelector('#inputSearch');

function onSearchHandler(e) {
    searchKeyword = eleSchInput.value.trim().toLowerCase();
    if (searchKeyword === '') eleSchInput.value = '';
    //============== 검색 실행 ===============================
    document.querySelector('#listWrap').innerHTML = '';
    getPokemonData().then((res) => {
        const filteredArray = res.filter((item) => {
            return item.name.includes(searchKeyword);
        });
        console.log('필터값 : ', filteredArray);
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
