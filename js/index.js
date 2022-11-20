document.addEventListener("DOMContentLoaded", function () {

    function $ (selector) {
        return document.querySelector(selector);
    }

    let canvasWrapper = $("#ks-canvas-wrapper");
    let canvas = $("#ks-canvas");

    let canvasX = 0 - canvas.offsetWidth / 2 + canvasWrapper.offsetWidth / 2;
    let canvasY = 0;

    let canvasScale = window.innerWidth < 920 ? 0.5 : 0.7;

    let lastCanvasX = null;
    let lastCanvasY = null;

    let lastZoomX = null;
    let lastZoomY = null;
    let lastCanvasScale = null;

    let moveX = null;
    let moveY = null;

    let style = {};

    function stylesToString (styles) {
        let names = Object.keys(style);
        let stylesString = "";

        for (let i = 0; i < names.length; i++) {
            stylesString += names[i] + ": " + styles[names[i]] + "; ";
        }

        return stylesString;
    }
    
    function hypo (x1, x2, y1, y2) {
        let a = Math.pow(Math.abs(x1 - x2), 2);
        let b = Math.pow(Math.abs(y1 - y2), 2);

        return Math.sqrt(a + b);
    }

    function setCanvasPosition (x = 0, y = 0, s, c, w) {
        x = x > 0 ? 0 : x;
        y = y > 0 ? 0 : y;

        let wrapperWidth = w.offsetWidth;
        let wrapperHeight = w.offsetHeight;

        let canvasWidth = c.offsetWidth;
        let canvasHeight = c.offsetHeight;

        x = canvasWidth  - wrapperWidth  < x ? canvasWidth  - wrapperWidth  : x;
        y = canvasHeight - wrapperHeight < y ? canvasHeight - wrapperHeight : y;

        style["transform"] = "translate3d("+x+"px,"+y+"px,0px) scale("+s+")";
        style["transform-origin"] = (x * -1 + wrapperWidth / 2) + "px " + (y * -1 + wrapperHeight / 2) + "px";

        c.style = stylesToString(style);
        
        return {
            x: x, y: y
        }
    }

    setCanvasPosition(canvasX, canvasY, canvasScale, canvas, canvasWrapper);

    function moveStart (e) {
        moveX = e.touches ? e.touches[0].pageX : e.pageX;
        moveY = e.touches ? e.touches[0].pageY : e.pageY;

        // moveX = pageX;
        // moveY = pageY;

        style["cursor"] = "grabbing";
        style["transition"] = "none";

        lastCanvasX = canvasX;
        lastCanvasY = canvasY;

        if (e.touches && e.touches.length > 1) {
            lastZoomX = e.touches[1] ? e.touches[1].pageX : null;
            lastZoomY = e.touches[1] ? e.touches[1].pageY : null;

            lastCanvasScale = canvasScale;
        }
    }

    function move (e) {
        e.preventDefault();
        if (moveX !== null && moveY !== null) {
            let pageX = e.touches ? e.touches[0].pageX : e.pageX;
            let pageY = e.touches ? e.touches[0].pageY : e.pageY;


            if (
                lastZoomX !== null &&
                lastCanvasY !== null &&
                lastCanvasScale !== null
               ) {
                let zoomX = null;
                let zoomY = null;
    
                if (e.touches) {
                    zoomX = e.touches[1] ? e.touches[1].pageX : null;
                    zoomY = e.touches[1] ? e.touches[1].pageY : null;
                }
    
                if (zoomX !== null && zoomY !== null) {
                    let c1 = hypo(moveX, lastZoomX, moveY, lastZoomY);
                    let c2 = hypo(pageX, zoomX, pageY, zoomY);
    
                    let scaleDiff = Math.abs(c1 - c2) > 500 ? 500 : (c1 - c2) * -1;
    
                    canvasScale = lastCanvasScale + scaleDiff / 500;
    
                    canvasScale = canvasScale < 0.2 ? 0.2 : (canvasScale > 1 ? 1 : canvasScale);
                    $("#log").textContent = canvasScale;
                }
            }

            let scaleFactor = 2.5 - canvasScale;
            
            let newCanvasPosition = setCanvasPosition(
                canvasX + (pageX - moveX) * scaleFactor,
                canvasY + (pageY - moveY) * scaleFactor,
                canvasScale,
                canvas,
                canvasWrapper
            );
            lastCanvasX = newCanvasPosition.x;
            lastCanvasY = newCanvasPosition.y;
        }
    }

    function moveEnd () {
        if (moveX !== null && moveY !== null) {
            delete style["cursor"];
            delete style["transition"];
            style["transform"] = "translate3d("+lastCanvasX+"px,"+lastCanvasY+"px,0px) scale("+canvasScale+")";
            canvas.style = stylesToString(style);
            canvasX = lastCanvasX;
            canvasY = lastCanvasY;
            moveX = null;
            moveY = null;
            lastCanvasX = null;
            lastCanvasY = null;
            lastZoomX = null;
            lastZoomY = null;
            lastCanvasScale = null;
        }
    }
    
    canvas.ontouchstart = moveStart;
    canvas.ontouchmove = move;
    canvas.ontouchend = moveEnd;
    
    canvas.onmousedown = moveStart;
    canvas.onmousemove = move;
    canvas.onmouseup = moveEnd;
    canvas.onmouseleave = moveEnd;

    canvas.onwheel = function (e) {
        let delta = e.deltaY / -300;

        canvasScale += delta;

        canvasScale = canvasScale < 0.5 ? 0.5 : (canvasScale > 2 ? 2 : canvasScale);

        setCanvasPosition(canvasX, canvasY, canvasScale, canvas, canvasWrapper);
    }

    let buttonZoomin = $("#ksbtn-zoomin");
    let buttonZoomout = $("#ksbtn-zoomout");

    function zoomIn () {
        if (canvasScale >= 2) {
            canvasScale = 1.9;
            buttonZoomin.disabled = "true";
        }
        
        buttonZoomout.disabled = null;
        canvasScale+=0.2;
        canvasScale = Number(Number(canvasScale).toFixed(1));
        setCanvasPosition(canvasX, canvasY, canvasScale, canvas, canvasWrapper);
    }

    function zoomOut () {
        if (canvasScale <= 0.5) {
            canvasScale = 0.6;
            buttonZoomout.disabled = "true";
        }
        
        buttonZoomin.disabled = null;
        canvasScale-=0.2;
        canvasScale = Number(Number(canvasScale).toFixed(1));
        setCanvasPosition(canvasX, canvasY, canvasScale, canvas, canvasWrapper);
    }

    buttonZoomin.onclick = zoomIn;
    buttonZoomout.onclick = zoomOut;

    // ============================================== //

    function showModal (title, content, x, y, edge, pos) {
        let modal = $("#ks-modal");
        modal.style = "transform: translate3d("+x+"px, "+y+"px, 0px)"

        modal.className = "ks-modal";

        if (edge === "left") {
            modal.classList.add("ks-modal__left")

            if (pos === "top") {
                modal.classList.add("ks-modal__leftTop")
            }

            if (pos === "center") {
                modal.classList.add("ks-modal__leftCenter")
            }

            if (pos === "bottom") {
                modal.classList.add("ks-modal__leftBottom")
            }
        }
        else if (edge === "top") {
            modal.classList.add("ks-modal__top")

            if (pos === "left") {
                modal.classList.add("ks-modal__topLeft")
            }

            if (pos === "center") {
                modal.classList.add("ks-modal__topCenter")
            }

            if (pos === "right") {
                modal.classList.add("ks-modal__topRight")
            }
        }
        else if (edge === "right") {
            modal.classList.add("ks-modal__right")

            if (pos === "top") {
                modal.classList.add("ks-modal__rightTop")
            }

            if (pos === "center") {
                modal.classList.add("ks-modal__rightCenter")
            }

            if (pos === "bottom") {
                modal.classList.add("ks-modal__rightBottom")
            }
        }
        else if (edge === "bottom") {
            modal.classList.add("ks-modal__bottom")

            if (pos === "left") {
                modal.classList.add("ks-modal__bottomLeft")
            }

            if (pos === "center") {
                modal.classList.add("ks-modal__bottomCenter")
            }

            if (pos === "right") {
                modal.classList.add("ks-modal__bottomRight")
            }
        }

        $("#ks-modal-title").innerHTML = title;
        $("#ks-modal-content").innerHTML = content;
        $("#ks-modal-wrapper").style = "";
    }

    function closeModal () {
        $("#ks-modal-wrapper").style = "display: none;";
    }

    $("#ks-modal-background").onclick = closeModal;
    $("#ks-close-btn").onclick = closeModal;

    let block1 = $("#ksb-1");
    block1.onclick = function () {
        let rect = block1.getClientRects();

        let title = "Занесение состава изделия";
        let htmlContent = "" +
        "<h2 class='ks-modal_contentHeader'>"+
        "   Читать инструкцию:"+
        "</h2>"+
        "<ul class='ks-modal_contentList'>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/constr/manualtree/' target='_blank' rel='noopener noreferer'>Занесение дерева изделия вручную</a>"+
        "   </li>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/constr/import_tree-product/' target='_blank' rel='noopener noreferer'>Импорт состава (дерева) изделия из Excel </a>"+
        "   </li>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/constr/analogs/' target='_blank' rel='noopener noreferer'>Работа с аналогами</a>"+
        "   </li>"+
        "</ul>"+
        "<h2 class='ks-modal_contentHeader'>"+
        "   Смотреть видео:"+
        "</h2>"+
        "<ul class='ks-modal_contentList'>"+
        "   <li class='ks-modal_contentListItem ks-modal_contentListVideo'>"+
        "       <a href='https://www.youtube.com/watch?v=SCP6nKLNwZ4' target='_blank' rel='noopener noreferer'>Управление изменениями на производстве</a>"+
        "   </li>"+
        "   <li class='ks-modal_contentListItem ks-modal_contentListVideo'>"+
        "       <a href='https://www.youtube.com/watch?v=1kHpmDfqqxI' target='_blank' rel='noopener noreferer'>Как контролировать работу конструкторов на производстве</a>"+
        "   </li>"+
        "</ul>";

        let x = rect[0].x + (300 * canvasScale);
        let y = rect[0].y - 60;

        showModal(title, htmlContent, x, y, "left", "top");
    }

    let block2 = $("#ksb-2");
    block2.onclick = function () {
        let rect = block2.getClientRects();

        let title = "Занесение технологии изготовления";
        let htmlContent = "" +
        "<h2 class='ks-modal_contentHeader'>"+
        "   Читать инструкцию:"+
        "</h2>"+
        "<ul class='ks-modal_contentList'>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/constr/technological_operations/' target='_blank' rel='noopener noreferer'>Технологические операции. Справочная информация </a>"+
        "   </li>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/constr/to/' target='_blank' rel='noopener noreferer'>Занесение техопераций через интерфейс </a>"+
        "   </li>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/constr/13-import-tehoperaczij-iz-excel/' target='_blank' rel='noopener noreferer'>Импорт техопераций из Excel </a>"+
        "   </li>"+
        "</ul>";

        let x = rect[0].x + (300 * canvasScale);
        let y = rect[0].y - 60;

        showModal(title, htmlContent, x, y, "left", "top");
    }

    let block3 = $("#ksb-3");
    block3.onclick = function () {
        let rect = block3.getClientRects();

        let title = "Утверждение изделия";
        let htmlContent = "" +
        "<h2 class='ks-modal_contentHeader'>"+
        "   Читать инструкцию:"+
        "</h2>"+
        "<ul class='ks-modal_contentList'>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/constr/change_tree/' target='_blank' rel='noopener noreferer'>Управление изменениями в составах</a>"+
        "   </li>"+
        "</ul>";

        let x = rect[0].x + (300 * canvasScale);
        let y = rect[0].y - 60;

        showModal(title, htmlContent, x, y, "left", "top");
    }

    let block4 = $("#ksb-4");
    block4.onclick = function () {
        let rect = block4.getClientRects();

        let title = "Занесение заказа";
        let htmlContent = "" +
        "<h2 class='ks-modal_contentHeader'>"+
        "   Читать инструкцию:"+
        "</h2>"+
        "<ul class='ks-modal_contentList'>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/customers/insert_ccount/' target='_blank' rel='noopener noreferer'>Занесение счета</a>"+
        "   </li>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/interface/gdspos/' target='_blank' rel='noopener noreferer'>Наполнение документов товарными позициями</a>"+
        "   </li>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/proizv/forecast_readiness/' target='_blank' rel='noopener noreferer'>Прогноз готовности изделия (заказа)</a>"+
        "   </li>"+
        "</ul>";

        let x = rect[0].x + (300 * canvasScale);
        let y = rect[0].y - 60;

        showModal(title, htmlContent, x, y, "left", "top");
    }

    let block5 = $("#ksb-5");
    block5.onclick = function () {
        let rect = block5.getClientRects();

        let title = "Запуск заказа в работу";
        let htmlContent = "" +
        "<h2 class='ks-modal_contentHeader'>"+
        "   Читать инструкцию:"+
        "</h2>"+
        "<ul class='ks-modal_contentList'>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/service/import_bank_vip/' target='_blank' rel='noopener noreferer'>Импорт банковской выписки</a>"+
        "   </li>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/customers/account_running/' target='_blank' rel='noopener noreferer'>Запуск счета в работу</a>"+
        "   </li>"+
        "</ul>";

        let x = rect[0].x + (120 * canvasScale) - 169;
        let y = rect[0].y + (80 * canvasScale);

        showModal(title, htmlContent, x, y, "top", "center");
    }

    let block6 = $("#ksb-6");
    block6.onclick = function () {
        let rect = block6.getClientRects();

        let title = "Формирование очереди закупок";
        let htmlContent = "" +
        "<h2 class='ks-modal_contentHeader'>"+
        "   Читать инструкцию:"+
        "</h2>"+
        "<ul class='ks-modal_contentList'>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/plan_zapas/prioritet_zayavka/' target='_blank' rel='noopener noreferer'>Очередь закупок</a>"+
        "   </li>"+
        "</ul>";

        let x = rect[0].x + (300 * canvasScale);
        let y = rect[0].y - 60;

        showModal(title, htmlContent, x, y, "left", "top");
    }

    let block7 = $("#ksb-7");
    block7.onclick = function () {
        let rect = block7.getClientRects();

        let title = "Заказ поставщику";
        let htmlContent = "" +
        "<h2 class='ks-modal_contentHeader'>"+
        "   Читать инструкцию:"+
        "</h2>"+
        "<ul class='ks-modal_contentList'>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/suppliers/supply_client_no_bestsupplier/' target='_blank' rel='noopener noreferer'>Формирование счета поставщика из очереди закупок </a>"+
        "   </li>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/suppliers/oop/' target='_blank' rel='noopener noreferer'>Очередь ожидания прихода</a>"+
        "   </li>"+
        "</ul>";

        let x = rect[0].x + (300 * canvasScale);
        let y = rect[0].y - 60;

        showModal(title, htmlContent, x, y, "left", "top");
    }

    let block8 = $("#ksb-8");
    block8.onclick = function () {
        let rect = block8.getClientRects();

        let title = "Формирование очереди платежей";
        let htmlContent = "" +
        "<h2 class='ks-modal_contentHeader'>"+
        "   Читать инструкцию:"+
        "</h2>"+
        "<ul class='ks-modal_contentList'>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/zatrat/algorithm_zatrat/' target='_blank' rel='noopener noreferer'>Алгоритм работы системы управления платежами </a>"+
        "   </li>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/zatrat/inquiry/' target='_blank' rel='noopener noreferer'> Формирование заявки на оплату (запроса денежных сумм)</a>"+
        "   </li>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/zatrat/prioritet_zds/' target='_blank' rel='noopener noreferer'>Приоритет запросов денежных сумм</a>"+
        "   </li>"+
        "</ul>";

        let x = rect[0].x + (300 * canvasScale);
        let y = rect[0].y - 60;

        showModal(title, htmlContent, x, y, "left", "top");
    }

    let block9 = $("#ksb-9");
    block9.onclick = function () {
        let rect = block9.getClientRects();

        let title = "Приёмка на склад";
        let htmlContent = "" +
        "<h2 class='ks-modal_contentHeader'>"+
        "   Читать инструкцию:"+
        "</h2>"+
        "<ul class='ks-modal_contentList'>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/suppliers/makeinvoice/' target='_blank' rel='noopener noreferer'>Формирование приходной накладной (инвойса) и ее приходование</a>"+
        "   </li>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/ware/drive_pos/' target='_blank' rel='noopener noreferer'>Прием товара </a>"+
        "   </li>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/proizv/input_control/' target='_blank' rel='noopener noreferer'>Входной контроль</a>"+
        "   </li>"+
        "</ul>";

        let x = rect[0].x + (300 * canvasScale);
        let y = rect[0].y - 60;

        showModal(title, htmlContent, x, y, "left", "top");
    }

    let block10 = $("#ksb-10");
    block10.onclick = function () {
        let rect = block10.getClientRects();

        let title = "Подвоз материалов со склада";
        let htmlContent = "" +
        "<h2 class='ks-modal_contentHeader'>"+
        "   Читать инструкцию:"+
        "</h2>"+
        "<ul class='ks-modal_contentList'>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/proizv/cargoceh/' target='_blank' rel='noopener noreferer'>Перемещение в цех</a>"+
        "   </li>"+
        "</ul>";

        let x = rect[0].x ;
        let y = rect[0].y + (80 * canvasScale);

        showModal(title, htmlContent, x, y, "top", "left");
    }

    let block11 = $("#ksb-11");
    block11.onclick = function () {
        let rect = block11.getClientRects();

        let title = "Формирование очереди производства";
        let htmlContent = "" +
        "<h2 class='ks-modal_contentHeader'>"+
        "   Читать инструкцию:"+
        "</h2>"+
        "<ul class='ks-modal_contentList'>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/proizv/queue_product/' target='_blank' rel='noopener noreferer'>Очередь производства</a>"+
        "   </li>"+
        "</ul>";

        let x = rect[0].x - 398;
        let y = rect[0].y - 60;

        showModal(title, htmlContent, x, y, "right", "top");
    }

    let block12 = $("#ksb-12");
    block12.onclick = function () {
        let rect = block12.getClientRects();

        let title = "Контроль состояния производства";
        let htmlContent = "" +
        "<h2 class='ks-modal_contentHeader'>"+
        "   Читать инструкцию:"+
        "</h2>"+
        "<ul class='ks-modal_contentList'>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/proizv/situation_product/' target='_blank' rel='noopener noreferer'>Мониторинг ситуации по изделию</a>"+
        "   </li>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/proizv/production-supervision/' target='_blank' rel='noopener noreferer'>Наблюдение за производством из счета (очереди отгрузок)</a>"+
        "   </li>"+
        "</ul>";

        let x = rect[0].x - 398;
        let y = rect[0].y - 60;

        showModal(title, htmlContent, x, y, "right", "top");
    }

    let block13 = $("#ksb-13");
    block13.onclick = function () {
        let rect = block13.getClientRects();

        let title = "Составление плана производства";
        let htmlContent = "" +
        "<h2 class='ks-modal_contentHeader'>"+
        "   Читать инструкцию:"+
        "</h2>"+
        "<ul class='ks-modal_contentList'>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a target='_blank' rel='noopener noreferer'>Построение плана производства по узкому месту</a>"+
        "   </li>"+
        "</ul>"+
        "<h2 class='ks-modal_contentHeader'>"+
        "   Теория:"+
        "</h2>"+
        "<ul class='ks-modal_contentList'>"+
        "   <li class='ks-modal_contentListItem ks-modal_contentListVideo'>"+
        "       <a href='https://www.youtube.com/watch?v=ZZjM4yJgqMY' target='_blank' rel='noopener noreferer'>Теория планирования производства с динамическим узким местом</a>"+
        "   </li>"+
        "</ul>"+
        "<h2 class='ks-modal_contentHeader'>"+
        "   Практика:"+
        "</h2>"+
        "<ul class='ks-modal_contentList'>"+
        "   <li class='ks-modal_contentListItem ks-modal_contentListVideo'>"+
        "       <a href='https://www.youtube.com/watch?v=E4PsBV59L8g' target='_blank' rel='noopener noreferer'>Составление плана графика производства по динамическому узкому месту</a>"+
        "   </li>"+
        "</ul>";

        let x = rect[0].x - 365 + (260 * canvasScale);
        let y = rect[0].y + (80 * canvasScale);

        showModal(title, htmlContent, x, y, "top", "right");
    }

    let block14 = $("#ksb-14");
    block14.onclick = function () {
        let rect = block14.getClientRects();

        let title = "Запуск производственного задания (ПЗ)";
        let htmlContent = "" +
        "<h2 class='ks-modal_contentHeader'>"+
        "   Читать инструкцию:"+
        "</h2>"+
        "<ul class='ks-modal_contentList'>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/proizv/pz/' target='_blank' rel='noopener noreferer'>Запуск обычного производственного задания</a>"+
        "   </li>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/proizv/colorpz/' target='_blank' rel='noopener noreferer'> Цветовая дифференциация производственных заданий</a>"+
        "   </li>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/proizv/pa_neck/' target='_blank' rel='noopener noreferer'>Ключевые производственные задания</a>"+
        "   </li>"+
        "</ul>";

        let x = rect[0].x + (300 * canvasScale);
        let y = rect[0].y - 60;

        showModal(title, htmlContent, x, y, "left", "top");
    }

    let block15 = $("#ksb-15");
    block15.onclick = function () {
        let rect = block15.getClientRects();

        let title = "Выдача и закрытие сменных заданий на рабочих центрах";
        let htmlContent = "" +
        "<h2 class='ks-modal_contentHeader'>"+
        "   Читать инструкцию:"+
        "</h2>"+
        "<ul class='ks-modal_contentList'>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/proizv/ochered-to/' target='_blank' rel='noopener noreferer'>Очередь техопераций и выдача сменного задания</a>"+
        "   </li>"+
        "</ul>";

        let x = rect[0].x + (300 * canvasScale);
        let y = rect[0].y - 60;

        showModal(title, htmlContent, x, y, "left", "top");
    }

    let block16 = $("#ksb-16");
    block16.onclick = function () {
        let rect = block16.getClientRects();

        let title = "Закрытие ПЗ. Приём произведённых позиций";
        let htmlContent = "" +
        "<h2 class='ks-modal_contentHeader'>"+
        "   Читать инструкцию:"+
        "</h2>"+
        "<ul class='ks-modal_contentList'>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/proizv/close_pa_manual/' target='_blank' rel='noopener noreferer'>Закрытие ПЗ вручную</a>"+
        "   </li>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/proizv/close_pz/' target='_blank' rel='noopener noreferer'>Закрытие ПЗ сканером штрих-кода</a>"+
        "   </li>"+
        "</ul>";

        let x = rect[0].x + (300 * canvasScale);
        let y = rect[0].y - 60;

        showModal(title, htmlContent, x, y, "left", "top");
    }

    let block17 = $("#ksb-17");
    block17.onclick = function () {
        let rect = block17.getClientRects();

        let title = "Отгрузка Заказа";
        let htmlContent = "" +
        "<h2 class='ks-modal_contentHeader'>"+
        "   Читать инструкцию:"+
        "</h2>"+
        "<ul class='ks-modal_contentList'>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/dostavki/queue_otgruzka/' target='_blank' rel='noopener noreferer'>Очередь отгрузок</a>"+
        "   </li>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/ware/selection/' target='_blank' rel='noopener noreferer'>Подбор товара на складе</a>"+
        "   </li>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/ware/shipment_ware/' target='_blank' rel='noopener noreferer'>Отгрузка товара</a>"+
        "   </li>"+
        "</ul>";

        let x = rect[0].x + (300 * canvasScale);
        let y = rect[0].y - 60;

        showModal(title, htmlContent, x, y, "left", "top");
    }

    let block18 = $("#ksb-18");
    block18.onclick = function () {
        let rect = block18.getClientRects();

        let title = "Выгрузка отчета для бухгалтерии";
        let htmlContent = "" +
        "<h2 class='ks-modal_contentHeader'>"+
        "   Читать инструкцию:"+
        "</h2>"+
        "<ul class='ks-modal_contentList'>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/export_ava_1c/' target='_blank' rel='noopener noreferer'>Экспорт AVA-1С</a>"+
        "   </li>"+
        "</ul>";

        let x = rect[0].x;
        let y = rect[0].y - 230;

        showModal(title, htmlContent, x, y, "bottom", "left");
    }

    let block19 = $("#ksb-19");
    block19.onclick = function () {
        let rect = block19.getClientRects();

        let title = "Формирование финансовых показателей: ДЗ, КЗ, обороты";
        let htmlContent = "" +
        "<h2 class='ks-modal_contentHeader'>"+
        "   Читать инструкцию:"+
        "</h2>"+
        "<ul class='ks-modal_contentList'>"+
        "   <li class='ks-modal_contentListItem'>"+
        "       <a href='https://avaerp.com/instructions/for-users/financial/' target='_blank' rel='noopener noreferer'>Финансовые и другие показатели компании</a>"+
        "   </li>"+
        "</ul>";

        let x = rect[0].x + (121 * canvasScale) - 169;
        let y = rect[0].y - 280;

        showModal(title, htmlContent, x, y, "bottom", "center");
    }

    let block20 = $("#ksb-20");
    block20.onclick = function () {
        let rect = block20.getClientRects();

        let title = "Формирование первичной документации";
        let htmlContent = "";

        let x = rect[0].x - 365 + (260 * canvasScale);
        let y = rect[0].y - 180;

        showModal(title, htmlContent, x, y, "bottom", "right");
    }
});