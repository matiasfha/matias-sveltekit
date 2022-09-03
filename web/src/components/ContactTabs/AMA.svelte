<script lang="ts">
    import 'bytemd/dist/index.css'
    import { browser } from "$app/env";
    import { onDestroy, onMount } from "svelte";
    import { t } from '$lib/translations';

    import { Editor } from 'bytemd'
    import gfm from '@bytemd/plugin-gfm'
    import highlight from '@bytemd/plugin-highlight'

    let question = ""

    const plugins = [
        gfm(),
        highlight()
    ]

    function handleChange(e) {
        question = e.detail.value
    }

    let creatingIssue = false 

    const hcaptchaSitekey = import.meta.env.VITE_HCAPTCHA_SITEKEY;
    let hcaptcha = {}
    let hcaptchaWidgetID;

    

    onMount(() => {
        if (browser) {
            hcaptcha = window.hcaptcha;
            if (hcaptcha.render) {
                hcaptchaWidgetID = hcaptcha.render('hcaptcha', {
                    sitekey: hcaptchaSitekey,
                    size: 'invisible',
                    theme: 'dark',
                });
            }
        }
    });
    onDestroy(() => {
        if (browser) {
            hcaptcha = {}
        }
    });

    async function sendIssue(event) {
        creatingIssue = true
        const formData = new FormData(event.target)
        if(question === "") {
            alert('Please write your question')
            return
        }
        
        try {
            //@ts-ignore
            const { response: hCaptchaResponse, key } = await hcaptcha.execute(hcaptchaWidgetID, {
                async: true,
            })
            
            
            formData.append('hcaptcha', hCaptchaResponse)
            const res = await fetch('/api/github', {
                method: 'POST',
                body: formData
            })
            if(!res.ok) {
                console.error(res.status, res.statusText)
            }
            event.target.reset();
        }catch(e){
            console.error(e)
        }finally{
            creatingIssue = false
        }
    }

</script>

<svelte:head>
    <script src="https://js.hcaptcha.com/1/api.js" async defer></script>
</svelte:head>

<form class="text-center mt-2 text-ebony-clay-800 mx-auto w-4/5" on:submit|preventDefault={sendIssue}>
    <h3 class="text-2xl font-bold leading-normal mb-1 text-ebony-clay-800">{$t('about.ask')}</h3>
    <div class="text-xs mt-0 mb-2 font-bold uppercase">
        <i class="fas fa-map-marker-alt mr-2 opacity-75"></i>{$t('about.issue')}
    </div>
    <div class="flex flex-col gap-6 mt-8">
        <input type="text" placeholder="Title" class="text-sm border-slate-300 hover:border-slate-400 focus:border-border-slate-400 focus:bg-secondary px-6 py-4 w-full bg-white border rounded-lg focus:outline-none" name="title" required />
        <input type="text" placeholder="Your Name" class="text-sm border-slate-300 hover:border-slate-400 focus:border-border-slate-400 focus:bg-secondary px-6 py-4 w-full bg-white border rounded-lg focus:outline-none" name="name" required />
        <!-- <textarea class="border-slate-300 hover:border-slate-400 focus:border-border-slate-400 px-6 py-4 w-full bg-transparent border rounded-lg focus:outline-none h-60" placeholder="Your question" name="body" required /> -->
        <div>
        <span class="text-xs text-slate-500 opacity-80 flex self-start">Markdown supported</span>
        <Editor {plugins}  placeholder="Your question" value={question} on:change={handleChange} />
        </div>

        <button type="submit" class="mt-6 text-gray-200 font-bold py-2 px-4 rounded-lg hover:opacity-80 focus:opacity-70 focus:outline-none bg-[#6366F1] disabled:opacity-60 disabled:cursor-not-allowed" disabled={creatingIssue || question.length <= 0}>
            <span class="text-sm">{#if creatingIssue} {$t('about.publishing')} {:else} {$t('about.send')}{/if}</span>
        </button>
        <div
            id="hcaptcha"
            class="h-captcha"
            data-sitekey={hcaptchaSitekey}
            data-theme="dark"
            data-size="invisible"
        />  
        
        <p class="text-sm text-ebony-clay-800 ">This site is protected by hCaptcha and its <a href="https://www.hcaptcha.com/privacy">Privacy Policy</a> and <a href="https://www.hcaptcha.com/terms">Terms of Service</a> apply.</p>
        
    </div>
</form>

