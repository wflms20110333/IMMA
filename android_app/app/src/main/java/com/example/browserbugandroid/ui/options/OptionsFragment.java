package com.example.browserbugandroid.ui.options;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.SystemClock;
import android.provider.MediaStore;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemSelectedListener;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.ImageView;
import android.widget.Spinner;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.Observer;
import androidx.lifecycle.ViewModelProviders;
import androidx.navigation.NavController;
import androidx.navigation.Navigation;
import androidx.navigation.ui.AppBarConfiguration;

import com.example.browserbugandroid.Alarm_Receiver;
import com.example.browserbugandroid.R;
import com.google.android.material.navigation.NavigationView;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Hashtable;

public class OptionsFragment extends Fragment {

    private OptionsViewModel optionsViewModel;

    // to make an alarm manager
    AlarmManager alarm_manager;
    Spinner freq_picker;
    TextView bbug_name;
    Switch activation_switch;
    PendingIntent pending_intent;
    Context context;
    private View root;
    final String CHANNEL_ID = "bbugChannel";

    boolean spinnerFirstSelection; // prevent from showing a toast as soon as page is opened

    SharedPreferences sharedPref;
    SharedPreferences.Editor editor;

    NavigationView navigationView;
    View header;

    // temporarily store dictionary for spinner labels -> milliseconds
    Hashtable<String, Integer> spinner_dict = new Hashtable<String, Integer>();

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        root = inflater.inflate(R.layout.fragment_options, container, false);
        context = getContext();
        Log.i("NotifActivity.java", "========== notif activity started ==========");
        optionsViewModel = ViewModelProviders.of(this).get(OptionsViewModel.class);
        View root = inflater.inflate(R.layout.fragment_options, container, false);

        spinnerFirstSelection = false;

        Button toStudio = (Button) root.findViewById(R.id.to_studio_button);
        toStudio.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                NavController navController = Navigation.findNavController(getActivity(), R.id.nav_host_fragment);
                navController.navigate(R.id.nav_studio);
            }
        });

        // Initialize objects
        alarm_manager = (AlarmManager) getActivity().getSystemService(android.content.Context.ALARM_SERVICE); // initialize alarm manager
        freq_picker = (Spinner) root.findViewById(R.id.msgFreqSpinner); // initialize frequency picker
        bbug_name = (TextView) root.findViewById(R.id.bbugName); // initialize character label
        activation_switch = (Switch) root.findViewById(R.id.activationSwitch); // initialize switch

        navigationView = getActivity().findViewById(R.id.nav_view);
        header = navigationView.getHeaderView(0);

        // Load the absorbed variables
        sharedPref = getActivity().getSharedPreferences("BBugPref", Context.MODE_MULTI_PROCESS);
        editor = sharedPref.edit();
        final String storedBbugName = sharedPref.getString("bbugName", null);
        bbug_name.setText(storedBbugName);

        // Populate menu of the spinner
        populateSpinner(spinner_dict);
        ArrayAdapter<CharSequence> adapter = ArrayAdapter.createFromResource(getActivity(), R.array.freqtimes, android.R.layout.simple_spinner_item);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        freq_picker.setAdapter(adapter);
        freq_picker.setSelection(0);

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

        // Initialize image preview
        final Uri avatarPath = Uri.parse(sharedPref.getString("avatarPath", null));
        try {
            Bitmap selectedImage = MediaStore.Images.Media.getBitmap(getActivity().getContentResolver(), avatarPath);
            selectedImage = selectedImage.createScaledBitmap(selectedImage, 128, 128, true); // scale img
            ImageView headerIcon = root.findViewById(R.id.avatar_preview);
            headerIcon.setImageBitmap(selectedImage);
        } catch (Exception ex) { // set to default image
            ImageView headerIcon = root.findViewById(R.id.avatar_preview);
            headerIcon.setImageResource(R.drawable.logo);
            Log.i("OptionsFragment", "can't access file "+avatarPath);
        }

        // Initialize the activation switch
        String bbugActive = sharedPref.getString("bbugActive", "error 999");
        if (bbugActive.equals("active")) {
            activation_switch.setChecked(true);
        } else if (bbugActive.equals("inactive")) {
            activation_switch.setChecked(false);
        } else {
            Log.i("OptionsFragment", bbugActive + "error with bbugActive");
        }

        // Listener for activation
        activation_switch.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked){
                Log.i("NotifActivity.java", "========== switch switched ==========");
                if (isChecked) {
                    activateAlarms();
                    editor.putString("bbugActive", "active");
                    editor.commit();
                    Toast.makeText(context, storedBbugName + " activated!", Toast.LENGTH_SHORT).show();
                    // update header
                    TextView navHeaderText = header.findViewById(R.id.nav_header_text);
                    navHeaderText.setText("active");
                } else {
                    // inactivate alarm
                    alarm_manager.cancel(pending_intent);
                    editor.putString("bbugActive", "inactive");
                    editor.commit();
                    Toast.makeText(context, storedBbugName + " deactivated", Toast.LENGTH_SHORT).show();
                    // update header
                    TextView navHeaderText = header.findViewById(R.id.nav_header_text);
                    navHeaderText.setText("inactive");
                }
            }
        });
        freq_picker.setOnItemSelectedListener(new OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parentView, View selectedItemView, int position, long id){
                if (spinnerFirstSelection == true) {
                    Toast.makeText(context, "Message frequency updated!", Toast.LENGTH_SHORT).show();
                } else {
                    spinnerFirstSelection = true;
                }
            }
            @Override
            public void onNothingSelected(AdapterView<?> parentView){
                if (spinnerFirstSelection == true) {
                    Toast.makeText(context, "Message frequency not changed", Toast.LENGTH_SHORT).show();
                } else {
                    spinnerFirstSelection = true;
                }
            }
        });

        return root;
    }

    private void populateSpinner(Hashtable<String, Integer> spinner_dict) {
        spinner_dict.put("10 seconds", 10000);
        spinner_dict.put("1 minute", 60000);
        spinner_dict.put("15 minutes", 900000);
        spinner_dict.put("30 minutes", 1800000);
        spinner_dict.put("1 hour", 3600000);
        spinner_dict.put("2 hours", 7200000);
    }

    private void activateAlarms() {
        // #TODO start alarms after restart https://developer.android.com/training/scheduling/alarms#boot
        Log.i("NotifActivity.java", "========== setting alarm ==========");

        //String CHANNEL_ID = "bbugChannel";

        // create intent to the Alarm Receiver class
        final Intent my_intent = new Intent(getActivity(), Alarm_Receiver.class);
        my_intent.putExtra("chnl_id", CHANNEL_ID);

        // add the absorbed values to the intent
        my_intent.putExtra("bbugName", sharedPref.getString("bbugName", "Browserbee"));
        my_intent.putExtra("emojiVal", sharedPref.getInt("emojiVal", 1));
        my_intent.putExtra("capitalVal", sharedPref.getInt("capitalVal", 1));
        my_intent.putExtra("punctVal", sharedPref.getInt("punctVal", 1));
        my_intent.putExtra("avatarPath", sharedPref.getString("avatarPath", null));

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