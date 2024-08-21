let myLocalPokeData = [];

// 세데별 메뉴
async function getMenu() {
    try {
        const url = 'https://pokeapi.co/api/v2/generation/';
        const result = await fetch(url);
        const data = await result.json();

        // 각 세대 URL로부터 한국어 이름 가져오기
        const menuPromises = data.results.map(async (item) => {
            const response = await fetch(item.url);
            const generationData = await response.json();
            return generationData.names.find((name) => name.language.name === 'ko')?.name || '번역없음';
        });

        // 모든 비동기 작업이 완료될 때까지 기다림
        return Promise.all(menuPromises);
    } catch (err) {
        console.error('Error fetching generation data:', err);
        return [];
    }
}

getMenu().then((generationNames) => {
    renderGenMenu(generationNames);

    const buttonArr = document.querySelector('.gen_menu_wrap').querySelectorAll('button');
    buttonArr[initGenNum - 1].classList.add('on');
});

function renderGenMenu(generationNames) {
    const eleMenuWrap = document.querySelector('.gen_menu_wrap');
    // DOM 조작을 최소화하기 위해 HTML 문자열을 한 번에 생성
    const buttonsHTML = generationNames.map((name, idx) => `<button type="button" id="genBtn_${idx + 1}">${name}</button>`).join('');
    eleMenuWrap.innerHTML = buttonsHTML;

    //위와 같이 동적생성된 id를 가진 부모에 이벤트 위임 처리한다.
    eleMenuWrap.addEventListener('click', function (e) {
        const isButton = e.target.closest([(type = 'button')]);
        if (isButton) {
            const buttons = isButton.closest('div').querySelectorAll('button');
            // 모든 버튼 요소에서 'on' 클래스를 제거
            buttons.forEach((button) => {
                button.classList.remove('on');
            });
            isButton.classList.add('on');
            const splitTxt = isButton.getAttribute('id').split('_');
            const genNum = splitTxt[splitTxt.length - 1];
            startDataLoading(genNum);
        }
    });
}

/* async function testFnc() {
    const testUrl = 'https://pokeapi.co/api/v2/generation/1';
    const dd = await fetch(testUrl);
    const data = await dd.json();
    console.log('data : ', data.pokemon_species);
}
testFnc(); */

// 포켓몬 정보를 가져오는 함수
async function getPokemonData(prmGenNum) {
    let baseUrl = `https://pokeapi.co/api/v2/generation/${prmGenNum}`;

    try {
        const response = await fetch(baseUrl);
        const firstData = await response.json();

        const pokemonDataPromises = firstData.pokemon_species.map(async (item) => {
            console.log(firstData.pokemon_species.length);
            const divide = item.url.split('/');
            const pokeId = divide[divide.length - 2];
            //const pokemonUrl = item.url;
            const speciesUrl = item.url;

            const speciesResponse = await fetch(speciesUrl);
            const speciesDetail = await speciesResponse.json();

            //한국어 포켓몬 이름
            const koreanName = speciesDetail.names.find((name) => name.language.name === 'ko')?.name || '번역없음';
            //한국어 포켓몬 설명
            const koreanDescription = speciesDetail.flavor_text_entries.find((entry) => entry.language.name === 'ko')?.flavor_text || '번역없음';

            return {
                id: pokeId,
                name: koreanName,
                koreanDescription: koreanDescription,
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeId}.png`,
            };
        });

        return await Promise.all(pokemonDataPromises);
    } catch (error) {
        console.error('Error fetching Pokémon data:', error);
    }
}

const initGenNum = 1;
// 페이지 로드 시 데이터 가져오기
document.addEventListener('DOMContentLoaded', () => {
    startDataLoading(initGenNum);
});

function startDataLoading(prmGenNum) {
    document.querySelector('body > .loading_spinner').classList.add('on');
    getPokemonData(prmGenNum).then((response) => {
        myLocalPokeData = [...response];
        document.querySelector('body > .loading_spinner').classList.remove('on');
        renderPokemonList(myLocalPokeData);
    });
}

// 데이터를 화면에 출력하는 함수
function renderPokemonList(prmArrayData) {
    const eleListWrap = document.querySelector('#listWrap');

    eleListWrap.innerHTML = '';
    prmArrayData.forEach((item, idx) => {
        const eleDiv = document.createElement('div');
        eleDiv.id = item.id; //id 값 div에 넣어두기
        eleDiv.className = 'item_box';
        eleDiv.innerHTML = `
            <p class="m_name">${item.name}</p>
            <p class="m_id">No.${item.id}</p>
            <p class="m_img"><img src="${item.image}" alt="" /></p>`;

        eleListWrap.appendChild(eleDiv);

        // ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ 클릭시 모달열기
        eleDiv.addEventListener('click', function (e) {
            document.querySelector('body').classList.add('fixed');
            //document.querySelector('.modal_inner .loading_spinner').classList.add('on');
            renderModalData(e.currentTarget.id);
        });
    });
}

// ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ 모달 닫기
document.querySelector('#closeModal').addEventListener('click', function () {
    document.querySelector('body').classList.remove('fixed');
});
document.querySelector('.modal_bg_wrap').addEventListener('click', function () {
    document.querySelector('body').classList.remove('fixed');
});

// ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ 모달 inner 이벤트 전달끊기
document.querySelector('.modal_inner').addEventListener('click', function (e) {
    e.stopPropagation();
});

// ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ 모달 화면에 렌더링
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

    const getLocalData = myLocalPokeData.find((item) => item.id === prmId);

    eleMonName.textContent = getLocalData.name;
    eleMonNumber.textContent = 'No.' + getLocalData.id;
    eleMonImage.setAttribute('src', getLocalData.image);
    eleMonSummary.textContent = getLocalData.koreanDescription;
    eleDetailViewBtn.addEventListener('click', function () {
        location.href = `detail.html?id=${getLocalData.id}`;
    });
    /* 
    getModalPokemonData(prmId).then((response) => {
        if (response) {
            document.querySelector('.modal_inner .loading_spinner').classList.remove('on');
            eleMonAbility.textContent = response.abilities;
            eleMonTypes.textContent = response.types;
            eleMonHeight.textContent = response.height;
            eleMonWeight.textContent = response.weight;

            eleDetailViewBtn.addEventListener('click', function () {
                location.href = `detail.html?id=${getLocalData.id}`;
            });
        }
    }); */
}

// ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ 모달에 사용할 데이터 가져오기
async function getModalPokemonData(prmId) {
    try {
        const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${prmId}`;
        //const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${prmId}`;

        const pokemonResponse = await fetch(pokemonUrl);
        const pokemonDetail = await pokemonResponse.json();

        // ability url로 가서 능력 한글이름 과 설명 가져오기
        const abilitiesPromises = pokemonDetail.abilities.map(async (item) => {
            const abilityResponse = await fetch(item.ability.url);
            const abilityDetail = await abilityResponse.json();

            // 능력 한글제목 과 능력 설명 가져오기
            const abilityName = abilityDetail.names.find((item) => item.language.name === 'ko')?.name || '번역없음';
            const abilityDescription = abilityDetail.flavor_text_entries.find((item) => item.language.name === 'ko')?.flavor_text || '번역없음';

            return `${abilityName}: ${abilityDescription}`;
        });
        const abilities = await Promise.all(abilitiesPromises);

        //타입 url로 가서 타입 한글 이름 가져오기
        const typesPromises = pokemonDetail.types.map(async (item) => {
            const typeResponse = await fetch(item.type.url);
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
            /* id: pokemonDetail.id, //==========
            name: koreanName, //==========
            description: koreanDescription, //==========
            image: pokemonDetail.sprites.other['official-artwork'].front_default, //==========
 */
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
//=================search======================================================================
//=================search======================================================================
//=================search======================================================================
const eleSchBtn = document.querySelector('#submitBtn');
const eleSchInput = document.querySelector('#inputSearch');

function onSearchHandler(e) {
    searchKeyword = eleSchInput.value.trim().toLowerCase();
    /* if (searchKeyword === '') {
        eleSchInput.value = '';
        eleSchInput.focus();
        alert('검색어를 입력해주세요');
        return;
    } */

    //============== 검색 실행시 가져오기 ===============================
    document.querySelector('#listWrap').innerHTML = '';
    //document.querySelector('.mon_main .loading_spinner').classList.add('on');

    /* getPokemonData('search').then((response) => {
        const filteredArray = response.filter((item) => {
            return item.name.includes(searchKeyword);
        });
        console.log('검색값 : ', filteredArray);
        document.querySelector('.mon_main .loading_spinner').classList.remove('on');
        renderPokemonList(filteredArray);
    }); */
    filteredArray = myLocalPokeData.filter((item) => item.name.includes(searchKeyword));
    renderPokemonList(filteredArray);
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

document.addEventListener('DOMContentLoaded', function () {
    const modeBtn = document.querySelector('.mode_btn');

    modeBtn.addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');

        // 현재 모드를 로컬스토리지에 저장
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });

    // 페이지 로드 시 이전 모드를 확인하여 적용
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
});
