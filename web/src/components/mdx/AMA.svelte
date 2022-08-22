<script lang="ts">
    import { browser } from "$app/env";
    import { onDestroy, onMount } from "svelte";
    import { t } from '$lib/translations';
    console.log(t)
    let currentTab = 1
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
                console.log({ hcaptchaWidgetID })
            }
        }
    });
    onDestroy(() => {
        if (browser) {
            hcaptcha = {}
        }
    });
    const tabs = [
        {
            id: 1,
            text: $t('about.ask')
        },
        {
            id: 2,
            text: $t('about.call')
        },
        {
            id: 3,
            text: $t('about.coffee')
        },
        {
            id: 4,
            text: $t('about.uses')
        }
    ]

    function handleTab(tab: typeof tabs[0]) {
        currentTab = tab.id
    }

    async function sendIssue(event) {
        creatingIssue = true
        const formData = new FormData(event.target)
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
    <script src="https://js.hcaptcha.com/1/api.js?render=explicit" async defer></script>
</svelte:head>

<form class="relative mx-auto min-w-0 break-word bg-slate-200 w-full mb-6 shadow-lg rounded-xl">
    <div class="px-6"> 
        <div class="flex flex-wrap justify-center">
            <div class="w-full flex justify-center">
                <div class="relative">
                    <img
                        class="shadow-xl rounded-full align-middle border-none absolute -m-16 -ml-20 lg:-ml-16 max-w-[150px]"
                        src="https://res.cloudinary.com/matiasfha/image/upload/f_auto,q_auto,c_scale,w_150/v1661176031/photo-removebg-preview_vrjcf3.png"
                        alt="This is me :D"
                    />
                </div>
            </div>
            <h1 class="text-6xl mt-32 flex self-center">{$t('about.title')}</h1>
            <div class="w-full text-center" role="tablist">
                <div class="flex justify-center lg:pt-4 pt-8 pb-0">
                    {#each tabs as tab}
                        <div class="p-3 text-center cursor-pointer border-x-0 border-t-0 border-b-2 border-transparent hover:border-transparent focus:border-transparent transition-all duration-100 ease-in-out" 
                            role="presentation" class:active="{currentTab === tab.id}" aria-selected={tab.id === currentTab}>
                            <span on:click={() => handleTab(tab)} class="text-sm font-bold block uppercase tracking-wide text-slate-700">{tab.text}</span>
                        </div>
                    {/each}
                    
                    
                </div>
            </div>
        </div>

        {#if currentTab === 1}

        <form class="text-center mt-2 text-ebony-clay-800 mx-auto w-4/5" on:submit|preventDefault={sendIssue}>
            <h3 class="text-2xl font-bold leading-normal mb-1 text-ebony-clay-800">{$t('about.ask')}</h3>
            <div class="text-xs mt-0 mb-2 font-bold uppercase">
                <i class="fas fa-map-marker-alt mr-2 opacity-75"></i>{$t('about.issue')}
            </div>
            <div class="flex flex-col gap-6 mt-8">
                <input type="text" placeholder="Title" class="border-slate-300 hover:border-slate-400 focus:border-border-slate-400 focus:bg-secondary px-6 py-4 w-full bg-transparent border rounded-lg focus:outline-none" name="title" required />
                <input type="text" placeholder="Your Name" class="border-slate-300 hover:border-slate-400 focus:border-border-slate-400 focus:bg-secondary px-6 py-4 w-full bg-transparent border rounded-lg focus:outline-none" name="title" required />
                <textarea class="border-slate-300 hover:border-slate-400 focus:border-border-slate-400 px-6 py-4 w-full bg-transparent border rounded-lg focus:outline-none h-60" placeholder="Your question" name="body" required />


                <button type="submit" class="mt-6 text-gray-200 font-bold py-2 px-4 rounded-lg hover:opacity-80 focus:opacity-70 focus:outline-none bg-[#6366F1]" disabled={creatingIssue}>
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

        
            
                    
            
        
        {/if}

        {#if currentTab === 2}
        <!-- Principio del widget integrado de Calendly -->
        <div class="calendly-inline-widget" data-url="https://calendly.com/matiashernandez" style="min-width:320px;height:630px;"></div>
        <script type="text/javascript" src="https://assets.calendly.com/assets/external/widget.js" async></script>
        <!-- Final del widget integrado de Calendly -->

        {/if}
        {#if currentTab === 3}
        <div class="mt-6 py-6 text-center">
            <div class="flex flex-wrap justify-center">
                <div class="w-full px-4 text-ebony-clay-800 py-12 mx-auto prose prose-lg">
                    <p>
                        {$t('about.support')}
                    </p>
                    <div class="mx-auto w-56">
                        <a href="https://www.buymeacoffee.com/matiasfha" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
                    </div>
                </div>
            </div>
        </div>
        

        
        {/if}
        {#if currentTab === 4}
        <div class="mt-6 py-6 text-center">
            <div class="flex flex-wrap justify-center">
                <div class="w-full px-4 text-ebony-clay-800 py-12 mx-auto prose prose-lg ">
                    <p>
                    {@html $t('about.uses_text')}
                    </p>
                </div>
            </div>
        </div>
        {/if}
        
    </div>
    
</form>


<style>
    .active {
        color: #6366F1;
        border-color: #6366F1;
    }
</style>