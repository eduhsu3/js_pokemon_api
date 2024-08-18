// 포켓몬 정보를 가져오는 함수
async function getPokemonData(prmType) {
    let pokemonBaseListUrl = 'https://pokeapi.co/api/v2/pokemon?limit=20';
    if (prmType === 'search') {
        pokemonBaseListUrl = 'https://pokeapi.co/api/v2/pokemon?limit=380'; //390개부터는 404에러 뜬다.
    }

    try {
        const response = await fetch(pokemonBaseListUrl);
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
    //============== 검색 실행시 가져오기 ===============================
    document.querySelector('#listWrap').innerHTML = '';
    getPokemonData('search').then((response) => {
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
