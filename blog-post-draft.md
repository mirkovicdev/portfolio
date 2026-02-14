# I Built an App to Monitor My Own Heart Failure

Two hours before I was put in a wheelchair, I was at the gym benching 180 kilograms.

Personal best. I felt unstoppable.

My doctor called while I was still at the gym. Said I needed to go to the hospital immediately. I asked him if I could finish my workout first. I genuinely didn't understand why he sounded so worried.

I felt fine. Better than fine. I felt like I was at the peak of my life.

---

I was 22, studying applied physics and mathematics in Norway. Powerlifting was half of my identity. I was training to compete. Nine sessions a week. The other half was math - I was on an accelerated track, taking six courses at once.

Everything was going according to plan.

Then one day on a 10k run, I felt tingling in my hands. Like they were falling asleep. Then I almost passed out.

I blamed it on being out of shape for running. Went to the doctor anyway, just to check. He took an ECG and his face changed. He sent it to the hospital that same day.

Two days later: the phone call at the gym.

---

At the hospital, things moved fast. They gave me medications I didn't recognize. Scheduled me for an ultrasound, a CT scan, more tests.

Then they brought a wheelchair.

I said I could walk. They said no.

This was the moment I realized something was actually wrong. I had just been benching. I had just hit a PR. And now I wasn't allowed to walk.

The tests came back. My heart was enlarged. It wasn't beating properly. I had something called PVCs - premature ventricular contractions. My heart was misfiring constantly. And my ejection fraction - basically how well your heart pumps - was at 35%. Normal is 55-70%.

I had heart failure. At 22.

They started me on four different medications. I spent the next few days in the hospital, hooked up to machines, trying to understand what this meant for my life.

---

The hardest part wasn't the diagnosis. It was what came after.

For months, no one could give me a straight answer about anything.

Can I work out again? Maybe. We don't know. Be careful.

How careful? We can't say. Just... don't push it.

What does "push it" mean for someone who used to train nine times a week?

Silence.

I had read about football players with the same condition. Young, athletic, healthy-looking. They didn't know they had it. They just dropped dead on the field one day.

I started to wonder if the same thing would happen to me.

I became scared to leave my house. Scared to walk up stairs. Scared to do anything that might trigger whatever was wrong with my heart. Because I had no way of knowing what was happening inside my own body.

All my life I'd had complete control over my body. I trained it, pushed it, knew exactly what it could do.

This was the first time I had no control at all.

---

There's something else I haven't told many people.

Around the same time I got diagnosed, I lost all my money.

I had been trading. Not the smart kind - the emotional kind. Buying when I felt good about something, selling when I got scared. No system, no math, just feelings.

I lost everything I had saved. Couldn't pay rent. Had to figure that out while also figuring out if my heart was going to stop.

I didn't tell anyone. I was embarrassed. I was supposed to be the math guy. How could I be so stupid?

So there I was: heart failing, bank account empty, scared to leave my apartment, six math courses to pass, and absolutely no idea what to do next.

I felt like I had hit rock bottom.

---

One of the strangest parts of having heart failure at 22 is that you don't look sick.

I still looked like an athlete. I still had the build from years of powerlifting. People would see me and assume I was fine.

But I could feel every fifth heartbeat go wrong. That's what a 20% PVC burden means. One out of every five beats, my heart would misfire. All day. All night. A constant reminder that something inside me was broken.

I tried to hide it. I didn't know if people would believe me. I didn't know how to explain that I looked healthy but felt like I could die at any moment.

---

The hospital gave me a Holter monitor once - a device you wear for 24 hours that records your heart rhythm. I wore it, sent it back, waited weeks for results.

The report said I had 20% extra beats. That was it. No context about what I could do, what I should avoid, how my heart responded to different activities.

I wanted to work out again. Exercise was how I processed everything. It was my identity. But I was terrified that if I pushed too hard, I'd go into a dangerous rhythm and collapse before anyone could help me.

I needed information. Real-time information. Something that could tell me what my heart was doing right now, not what it did three weeks ago in a report.

So I decided to build it myself.

---

I should mention: I didn't know how to code.

I mean, I had taken programming courses at university. I could write algorithms on paper. But I had never actually built anything. Never shipped a product. Never made something real.

That changed in May 2025 when I met Koen and Hugues.

I had applied to an internship at their startup, mostly out of desperation to do something other than sit at home being scared. They invited me to Norway for what they called a "build sprint" - basically a group of founders and builders living together in a house, working on their projects, sharing ideas.

In two weeks, they taught me how to actually code. Not the academic kind. The real kind. You have an idea, you write code, you make it exist.

Something clicked.

---

I had a Polar H10 - a chest strap heart monitor. It's supposed to show your heart rate, your BPM. But here's the thing: it actually works by taking an ECG. It records the electrical signals from your heart, then calculates your heart rate from that.

The ECG data is there. They just don't show it to you. They only show the number.

I wanted to see my actual ECG. In real time. On my phone.

So I reverse-engineered it.

I spent my days at the build sprint working with the team, learning the basics. Then I came home every night and worked on this. Late summer nights, just me and my laptop, trying to figure out how to extract ECG data from a Bluetooth protocol that wasn't meant to share it.

The first week was just trying to get any data to display. It was hard. I had no idea what I was doing. But I was determined. This wasn't a side project. This was about getting my life back.

---

I remember the exact moment it worked.

Late night. Probably 2am. I had been stuck on the same problem for days. Then suddenly - there it was. My ECG. Live. On my phone screen.

I could see my heartbeat in real time. I could see the PVCs happening. I could see my own heart misfiring.

I felt this wave of relief wash over me. Not just because it worked - but because I knew: if I could build this, I could build other things too. If I could solve this problem, I could solve more problems.

For the first time in months, I felt like I had some control.

---

I kept building. Over the next two weeks, I added more features:

- Real-time ECG display
- PVC detection based on my specific heart rhythm patterns
- Rolling window analysis to see if my arrhythmia was getting better or worse during workouts
- Alerts if I went into a dangerous rhythm

It wasn't perfect. It was specialized to my exact type of PVCs, my morphologies. But it worked. For me.

I could finally work out again. I could watch my heart in real time, see how it responded to exercise, and stop if something looked wrong.

The fear didn't disappear completely. But it became manageable. I had information. I had control.

---

A few weeks later, I got the chance to pitch this at a Y Combinator event in Paris.

I told my story. Showed the app. Explained why I built it.

People kept asking me about the business model, the market size, the monetization strategy. I told them the truth: the market for this is tiny. Most people don't have my condition. I'm not trying to build a unicorn.

If I could help just ten people who have the same fear I had, who feel trapped in their own bodies, who just want to exercise without being terrified - I would be happy.

I know how it feels when that fear finally lifts. I want other people to feel that too.

---

That summer changed everything.

I started posting on Instagram about what I was learning - quantitative finance, mathematics, building. I called the account @mirkovicdev. I had nothing to lose. I was rebuilding my life anyway.

In six months, I went from zero to 110,000 followers.

In January, I launched QuantFrame, a platform teaching people how to approach trading mathematically. Because I remembered losing all my money trading on feelings. I didn't want others to make the same mistake.

4,000 people signed up in the first month. 

I've been to five build sprints now - Dubai, France, Washington DC, and more. The same group that taught me to code became some of my closest friends. We build together, travel together, push each other.

I've learned more in the past six months than in my entire life before that.

---

My heart condition isn't cured. I still have 20% PVCs. I still take four medications every day. I still feel every fifth heartbeat go wrong.

In April, I'm scheduled for an ablation - a procedure where they try to destroy the parts of my heart causing the misfires. The doctors are cautiously optimistic. The condition is complex. There are multiple spots causing problems, not just one.

I don't know how it will go. I might improve significantly. I might need multiple procedures. I might be managing this for the rest of my life.

But I'm not scared anymore. At least not the same way.

---

A year ago, I was in a hospital bed at 3am, heart going haywire, trying to finish an algorithms and data structures assignment, wondering if I had made the wrong choices in life.

Now I wake up and I build things. I teach people. I travel with other builders. I have an audience that actually cares about what I'm working on.

I still don't have all the answers. I don't know if my heart will ever be normal. I don't know where QuantFrame will go. I don't know what I'll build next.

But I know this: when everything fell apart, building is what put me back together.

The app I made isn't perfect. It's not a commercial product. It probably never will be. But it gave me something back that I thought I had lost forever.

Control.

---

If you're going through something similar - health problems, financial problems, feeling like you've lost your identity - I don't have advice for you. Everyone's situation is different.

But I can tell you what worked for me: I built something.

Not because I thought it would make me money or famous. Just because I needed it. Because I was desperate to have some control over something, anything, in my life.

And that one small thing led to everything else.

---

*If you want to see the app in action, I'll be posting a demo on my Instagram [@mirkovicdev](https://instagram.com/mirkovicdev) soon. And if you're interested in learning quantitative finance the right way - with math, not feelings - check out [QuantFrame](https://quantframe.io).*

*If you're dealing with heart issues and want to talk, my DMs are open. I'm not a doctor. But I know what it's like to be 22, scared, and feeling completely alone in this.*
