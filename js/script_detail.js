// 포켓몬 정보를 가져오는 함수
async function getPokemonData() {
    const baseUrl = 'https://pokeapi.co/api/v2';
    const pokemonLimit = 150; // 가져올 포켓몬 수
    /* const pokemonLimit = 275; // 가져올 포켓몬 수 */

    try {
        const response = await fetch(`${baseUrl}/pokemon?limit=${pokemonLimit}`);
        const data = await response.json();
        const pokemonList = data.results;

        const pokemonDataPromises = pokemonList.map(async (item) => {
            const pokemonDetailResponse = await fetch(item.url);
            const pokemonDetail = await pokemonDetailResponse.json();

            const speciesResponse = await fetch(pokemonDetail.species.url);
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

        // 클릭시 모달열기
        eleDiv.addEventListener('click', function (e) {
            currentID = e.currentTarget.id;
            document.querySelector('body').classList.add('fixed');
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

//=================search======================================================================
const eleSchBtn = document.querySelector('#submitBtn');
const eleSchInput = document.querySelector('#inputSearch');

function onSearchHandler(e) {
    searchKeyword = eleSchInput.value.trim().toLowerCase();
    if (searchKeyword === '') eleSchInput.value = '';
    //============== 검색 실행 ===============================
    document.querySelector('#listWrap').innerHTML = '';
    getPokemonData().then((response) => {
        const filteredArray = response.filter((item) => {
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
