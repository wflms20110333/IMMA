package com.example.browserbugandroid;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.provider.MediaStore;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import java.util.Random;

public class Alarm_Receiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String CHANNEL_ID = intent.getExtras().getString("chnl_id");
        String storedBbugName = intent.getExtras().getString("bbugName");
        int storedEmoji = intent.getExtras().getInt("emojiVal");
        int storedCapital = intent.getExtras().getInt("capitalVal");
        int storedPunct = intent.getExtras().getInt("punctVal");
        String myMessage = pickMessage(storedEmoji, storedCapital, storedPunct);

        // Build notification
        long[] vibrationStats = {10, 150}; // how long before turn on, how long until turn off vibrate
        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.drawable.logo)
                .setContentTitle(storedBbugName+" says:")
                .setContentText(myMessage)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setVibrate(vibrationStats) // vibrate
                .setCategory(NotificationCompat.CATEGORY_MESSAGE)
                //.setContentIntent(pendingIntent)
                .setAutoCancel(true); // automatically removes notification on tap

        // Try to set custom image
        Uri avatarPath = null;
        try {
            avatarPath = Uri.parse(intent.getExtras().getString("avatarPath"));
            Bitmap selectedImage = MediaStore.Images.Media.getBitmap(context.getContentResolver(), avatarPath);
            selectedImage = selectedImage.createScaledBitmap(selectedImage, 128, 128, true); // scale img
            builder.setLargeIcon(selectedImage);
        } catch (Exception ex) {
            //Log.i("Alarm_Receiver", "image not good");
            Bitmap myLogo = BitmapFactory.decodeResource(context.getResources(), R.drawable.logo);
            builder.setLargeIcon(myLogo);
        }

        // Send a notification
        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
        notificationManager.notify(100, builder.build()); // notificationId is a unique int for each notification that you must define
    }

    /*
     * Pick a message given texting style
     */
    private static String pickMessage(int emoji, int capital, int punct) {
        final int EMOJI_BAR_SIZE = 4; // possible values for emojis: 0, 1, 2, 3
        final int CAPITAL_BAR_SIZE = 4;
        final int PUNCT_BAR_SIZE = 4;
        int randomNumber;

        String[] msgs ={"Don't forget to rest your eyes!", "How is your posture right now?", "Don't forget to drink water!",
                        "How are you doing?", "Don't get too distracted!", "How are you feeling?", "Take a break once in a while!",
                        "Hope you're doing okay!", "You've been doing a great job.", "Your work is important!", "Are your muscles tense?",
                        "Stay hydrated!", "Remember that you are amazing!", "Take a deep breath and recenter!"};
        String[] emojis ={" :)", " :D"};

        Random r = new Random();
        randomNumber = r.nextInt(msgs.length);
        String myMessage = msgs[randomNumber];

        // Add texting style

        if (capital == 0 || capital == 1) {
            myMessage = myMessage.toLowerCase();
        } else if (capital == CAPITAL_BAR_SIZE-1) {
            myMessage = myMessage.toUpperCase();
        }

        if (punct == 0 || punct == 1) {
            myMessage = myMessage.replaceAll("\\p{Punct}", "");
        } else if (punct == PUNCT_BAR_SIZE-1) {
            myMessage = myMessage.replace("!", "!!");
            myMessage = myMessage.replace("?", "??");
        }

        randomNumber = r.nextInt(EMOJI_BAR_SIZE-1);
        if (randomNumber < emoji) { // add an emoji
            randomNumber = r.nextInt(emojis.length);
            myMessage += emojis[randomNumber];
        }

        return myMessage;
    }
}
