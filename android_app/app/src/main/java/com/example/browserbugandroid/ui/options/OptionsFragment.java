package com.example.browserbugandroid.ui.options;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.SystemClock;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.CompoundButton;
import android.widget.Spinner;
import android.widget.Switch;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.Observer;
import androidx.lifecycle.ViewModelProviders;
import androidx.navigation.ui.AppBarConfiguration;

import com.example.browserbugandroid.Alarm_Receiver;
import com.example.browserbugandroid.R;

import java.util.Hashtable;

public class OptionsFragment extends Fragment {

    private OptionsViewModel optionsViewModel;

    // to make an alarm manager
    AlarmManager alarm_manager;
    Spinner freq_picker;
    TextView bbug_name;
    Switch activation_switch;
    PendingIntent pending_intent;
    final String CHANNEL_ID = "bbugChannel";

    // temporarily store dictionary for spinner labels -> milliseconds
    Hashtable<String, Integer> spinner_dict = new Hashtable<String, Integer>();

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        optionsViewModel =
                ViewModelProviders.of(this).get(OptionsViewModel.class);
        View root = inflater.inflate(R.layout.fragment_options, container, false);

//        super.onCreate(savedInstanceState);
//        setContentView(R.layout.activity_notifpage);

        spinner_dict.put("10 seconds", 10000);
        spinner_dict.put("1 minute", 60000);
        spinner_dict.put("15 minutes", 900000);
        spinner_dict.put("30 minutes", 1800000);
        spinner_dict.put("1 hour", 3600000);
        spinner_dict.put("2 hours", 7200000);

        Log.i("NotifActivity.java", "========== notif activity started ==========");

        // Initialize variables
        alarm_manager = (AlarmManager) getActivity().getSystemService(android.content.Context.ALARM_SERVICE); // initialize alarm manager
        freq_picker = (Spinner) root.findViewById(R.id.msgFreqSpinner); // initialize frequency picker
        bbug_name = (TextView) root.findViewById(R.id.bbugName); // initialize character label
        activation_switch = (Switch) root.findViewById(R.id.activationSwitch); // initialize switch

        Log.i("NotifActivity.java", "=================== still ok so far");

        // populate menu of the spinner
        ArrayAdapter<CharSequence> adapter = ArrayAdapter.createFromResource(getActivity(), R.array.freqtimes, android.R.layout.simple_spinner_item);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        freq_picker.setAdapter(adapter);
        freq_picker.setSelection(0);
        //freq_picker.setOnItemSelectedListener(this);

        // Create NotificationChannel, only on API 26+ bc class is new, not in support library
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = getString(R.string.channel_name);
            String description = getString(R.string.channel_description);
            int importance = NotificationManager.IMPORTANCE_DEFAULT;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
            channel.setDescription(description);
            // Register the channel with the system; you can't change the importance
            // or other notification behaviors after this
            NotificationManager notificationManager = getActivity().getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }

        // listeners
        // #TODO spinner listener
        activation_switch.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked){
                Log.i("NotifActivity.java", "========== switch switched ==========");
                if (isChecked) {
                    activateAlarms();
                } else {
                    // inactivate alarm
                    alarm_manager.cancel(pending_intent);
                }
            }
        });


        return root;
    }

    private void activateAlarms() {
        // #TODO start alarms after restart https://developer.android.com/training/scheduling/alarms#boot
        Log.i("NotifActivity.java", "========== setting alarm ==========");

        //String CHANNEL_ID = "bbugChannel";

        // create intent to the Alarm Receiver class
        final Intent my_intent = new Intent(getActivity(), Alarm_Receiver.class);
        my_intent.putExtra("chnl_id", CHANNEL_ID);

        // get frequency of notifications from the spinner
        String freq_of_notif = freq_picker.getSelectedItem().toString();
        Integer freq_in_ms = spinner_dict.get(freq_of_notif);
        Log.i("NotifActivity.java", "Selecting notification frequency of " + String.valueOf(freq_in_ms) + "ms");

        pending_intent = PendingIntent.getBroadcast(getActivity(), 0,
                my_intent, PendingIntent.FLAG_UPDATE_CURRENT);

        alarm_manager.setRepeating(AlarmManager.ELAPSED_REALTIME_WAKEUP,
                SystemClock.elapsedRealtime() + 1000,
                freq_in_ms, pending_intent);
    }
}